/**
 * Main processing engine for the scheduler
 * Orchestrates the processing of due scheduled posts
 */

import { db } from '@/db/client';
import { scheduledPosts, drafts, integrations } from '@/db/schema';
import { eq, and, lte, inArray } from 'drizzle-orm';
import { isDueForProcessing, SCHEDULER_CONFIG } from './time';
import { acquireLock, releaseLock, isAlreadyPublished } from './locks';
import { shouldRetry, updateWithRetryInfo, resetRetryInfo } from './retry';
import { publishToPlatforms } from '@/app/actions/integrations/publish';

export interface ProcessingResult {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: string[];
}

/**
 * Find due scheduled posts that need processing
 * Uses grace window and status filtering
 */
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
    .select({
      id: scheduledPosts.id,
      draftId: scheduledPosts.draftId,
      userId: scheduledPosts.userId,
      platforms: scheduledPosts.platforms,
      scheduledAt: scheduledPosts.scheduledAt,
      retryCount: scheduledPosts.retryCount,
      status: scheduledPosts.status,
    })
    .from(scheduledPosts)
    .where(
      and(
        lte(scheduledPosts.scheduledAt, graceWindow),
        eq(scheduledPosts.status, 'pending')
      )
    )
    .limit(SCHEDULER_CONFIG.MAX_CONCURRENCY);

  // Handle nullable retryCount by defaulting to 0
  return results.map(result => ({
    ...result,
    retryCount: result.retryCount ?? 0,
  }));
}

/**
 * Process a single scheduled post
 * Handles locking, publishing, and status updates
 */
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
    // Try to acquire lock
    const lockAcquired = await acquireLock(id);
    if (!lockAcquired) {
      return { success: false, error: 'Job already being processed' };
    }

    try {
      // Check if already published
      const alreadyPublished = await isAlreadyPublished(id, draftId, platforms);
      if (alreadyPublished) {
        // Mark as published since it was already successful
        await db
          .update(scheduledPosts)
          .set({
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(scheduledPosts.id, id));

        return { success: true };
      }

      // Get draft content
      const [draft] = await db
        .select()
        .from(drafts)
        .where(eq(drafts.id, draftId))
        .limit(1);

      if (!draft) {
        throw new Error('Draft not found');
      }

      // Verify user has integrations for all platforms
      const userIntegrations = await db
        .select()
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
          `Missing integrations for: ${missingPlatforms.join(', ')}`
        );
      }

      // Publish to platforms using existing action
      const publishResult = await publishToPlatforms({
        draftId,
        platforms,
        options: {
          // Pass any additional options here
        },
      });

      if (!publishResult.success) {
        throw new Error(publishResult.error || 'Publishing failed');
      }

      // Determine final status based on platform results
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

      // Update scheduled post status
      await db
        .update(scheduledPosts)
        .set({
          status: finalStatus,
          publishedAt: successCount > 0 ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(scheduledPosts.id, id));

      // Reset retry info on success
      if (finalStatus === 'published') {
        await resetRetryInfo(id);
      }

      return { success: true };
    } finally {
      // Always release the lock
      await releaseLock(id);
    }
  } catch (error) {
    // Handle retry logic
    const retryResult = shouldRetry(error, retryCount);

    if (retryResult.shouldRetry) {
      await updateWithRetryInfo(
        id,
        retryCount + 1,
        retryResult.nextAttemptAt,
        retryResult.errorMessage
      );
    } else {
      // Mark as failed
      await updateWithRetryInfo(
        id,
        retryCount + 1,
        undefined,
        retryResult.errorMessage
      );
    }

    return {
      success: false,
      error: retryResult.errorMessage,
    };
  }
}

/**
 * Main function to process all due jobs
 * Called by external cron or manual trigger
 */
export async function processDueJobs(): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Find due jobs
    const dueJobs = await findDueJobs();

    if (dueJobs.length === 0) {
      console.log('No due jobs found');
      return result;
    }

    console.log(`Found ${dueJobs.length} due jobs to process`);

    // Process jobs concurrently (up to max concurrency)
    const processingPromises = dueJobs.map(async job => {
      result.processed++;

      try {
        const jobResult = await processScheduledPost(job);

        if (jobResult.success) {
          result.successful++;
          console.log(`Successfully processed job ${job.id}`);
        } else {
          result.failed++;
          result.errors.push(`Job ${job.id}: ${jobResult.error}`);
          console.error(`Failed to process job ${job.id}:`, jobResult.error);
        }
      } catch (error) {
        result.failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Job ${job.id}: ${errorMessage}`);
        console.error(`Error processing job ${job.id}:`, error);
      }
    });

    // Wait for all jobs to complete
    await Promise.all(processingPromises);

    console.log(
      `Processing complete: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`
    );
  } catch (error) {
    console.error('Error in processDueJobs:', error);
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  return result;
}
