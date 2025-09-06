import { publishToPlatforms } from '@/app/actions/integrations/publish';
import { db } from '@/db/client';
import { drafts, integrations, scheduledPosts } from '@/db/schema';
import { and, eq, inArray, lte } from 'drizzle-orm';
import logger from '../logger';
import { acquireLock, isAlreadyPublished, releaseLock } from './locks';
import { resetRetryInfo, shouldRetry, updateWithRetryInfo } from './retry';
import { SCHEDULER_CONFIG } from './time';

export type ProcessingResult = {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: string[];
};

async function findDueJobs(): Promise<
  Array<{
    id: string;
    draftId: string;
    userId: string;
    platforms: string[];
    scheduledAt: Date;
    retryCount: number;
    status: string;
  }>
> {
  const now = new Date();
  const graceWindow = new Date(
    now.getTime() - SCHEDULER_CONFIG.GRACE_WINDOW_MS
  );

  const results = await db
    .update(scheduledPosts)
    .set({
      status: 'processing',
      updatedAt: new Date(),
    })
    .where(
      and(
        lte(scheduledPosts.scheduledAt, graceWindow),
        eq(scheduledPosts.status, 'pending')
      )
    )
    .returning({
      id: scheduledPosts.id,
      draftId: scheduledPosts.draftId,
      userId: scheduledPosts.userId,
      platforms: scheduledPosts.platforms,
      scheduledAt: scheduledPosts.scheduledAt,
      retryCount: scheduledPosts.retryCount,
      status: scheduledPosts.status,
    });

  return results.map(result => ({
    ...result,
    retryCount: result.retryCount ?? 0,
  }));
}

async function processScheduledPost(scheduledPost: {
  id: string;
  draftId: string;
  userId: string;
  platforms: string[];
  scheduledAt: Date;
  retryCount: number;
}): Promise<{ success: boolean; error?: string }> {
  const { id, draftId, userId, platforms, retryCount } = scheduledPost;

  try {
    const lockAcquired = await acquireLock(id);
    if (!lockAcquired) {
      return { success: false, error: 'Job already being processed' };
    }

    try {
      const alreadyPublished = await isAlreadyPublished(id, draftId, platforms);
      if (alreadyPublished) {
        await db
          .update(scheduledPosts)
          .set({
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(scheduledPosts.id, id))
          .returning();

        return { success: true };
      }

      const [draft] = await db
        .select({
          id: drafts.id,
          title: drafts.title,
          content: drafts.content,
          contentPreview: drafts.contentPreview,
          tags: drafts.tags,
          thumbnailUrl: drafts.thumbnailUrl,
          seoTitle: drafts.seoTitle,
          seoDescription: drafts.seoDescription,
        })
        .from(drafts)
        .where(eq(drafts.id, draftId))
        .limit(1);

      if (!draft) {
        throw new Error('Draft not found');
      }

      const userIntegrations = await db
        .select({
          platform: integrations.platform,
          apiKey: integrations.apiKey,
          accessToken: integrations.accessToken,
          refreshToken: integrations.refreshToken,
          publicationId: integrations.publicationId,
        })
        .from(integrations)
        .where(
          and(
            eq(integrations.userId, userId),
            eq(integrations.status, 'connected'),
            inArray(integrations.platform, platforms)
          )
        );

      const connectedPlatforms = new Set(userIntegrations.map(i => i.platform));
      const missingPlatforms = platforms.filter(
        p => !connectedPlatforms.has(p)
      );

      if (missingPlatforms.length > 0) {
        throw new Error(
          `Missing integrations for: ${missingPlatforms.join(
            ', '
          )}. Please go to Integrations page and connect these platforms.`
        );
      }

      const publishResult = await publishToPlatforms({
        draftId,
        platforms,
        options: {},
      });

      if (!publishResult?.success) {
        throw new Error(publishResult?.error || 'Publishing failed');
      }

      const platformResults = publishResult.data as Array<{
        platform: string;
        success: boolean;
        platformPostId?: string;
        platformUrl?: string;
        error?: string;
      }>;

      const successCount = platformResults.filter(r => r.success).length;
      const totalCount = platformResults.length;

      let finalStatus: 'published' | 'partial' | 'failed';
      if (successCount === totalCount) {
        finalStatus = 'published';
      } else if (successCount > 0) {
        finalStatus = 'partial';
      } else {
        finalStatus = 'failed';
      }

      await db
        .update(scheduledPosts)
        .set({
          status: finalStatus,
          publishedAt: successCount > 0 ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(scheduledPosts.id, id))
        .returning();

      if (finalStatus === 'published') {
        await db
          .update(drafts)
          .set({
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(drafts.id, draftId))
          .returning();
        await resetRetryInfo(id);
      } else if (finalStatus === 'failed') {
        await db
          .update(drafts)
          .set({
            status: 'draft',
            scheduledAt: null,
            updatedAt: new Date(),
          })
          .where(eq(drafts.id, draftId))
          .returning();
      }

      return { success: true };
    } finally {
      await releaseLock(id);
    }
  } catch (error) {
    const retryResult = shouldRetry(error, retryCount);

    if (retryResult.shouldRetry) {
      await updateWithRetryInfo(
        id,
        retryCount + 1,
        retryResult.nextAttemptAt,
        retryResult.errorMessage
      );
    } else {
      await updateWithRetryInfo(
        id,
        retryCount + 1,
        undefined,
        retryResult.errorMessage
      );
    }

    return { success: false, error: retryResult.errorMessage };
  }
}

export async function processDueJobs(): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const dueJobs = await findDueJobs();

    if (dueJobs.length === 0) {
      logger.info('No due jobs found');
      return result;
    }

    logger.info(`Found ${dueJobs.length} due jobs to process`);

    const processingPromises = dueJobs.map(async job => {
      result.processed++;

      try {
        const jobResult = await processScheduledPost(job);

        if (jobResult.success) {
          result.successful++;
          logger.info(`Successfully processed job ${job.id}`);
        } else {
          result.failed++;
          result.errors.push(`Job ${job.id}: ${jobResult.error}`);
          logger.error(`Failed to process job ${job.id}:`, {
            error: jobResult.error,
          });
        }
      } catch (error) {
        result.failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Job ${job.id}: ${errorMessage}`);
        logger.error(`Error processing job ${job.id}:`, { error });
      }
    });

    await Promise.all(processingPromises);

    logger.info(
      `Processing complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`
    );
  } catch (error) {
    logger.error('Error in processDueJobs:', { error });
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  return result;
}
