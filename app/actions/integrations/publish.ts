'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { drafts, integrations, platformPosts, userUsage } from '@/db/schema';
import logger from '@/lib/logger';
import {
  requireAuth,
  successResult,
  errorResult,
  revalidateDashboard,
  handleDatabaseError,
} from '../_utils';
import { publishToPlatformsSchema } from '@/lib/validators/integrations';
import { mapContentForPlatform } from '@/lib/integrations/mapper';
import {
  checkPlatformRateLimit,
  validateTitle,
} from '@/lib/integrations/_core';
import { createDevtoClient } from '@/lib/integrations/devto';
import { createHashnodeClient } from '@/lib/integrations/hashnode';
import { Draft } from '@/lib/types/drafts';
import { sql } from 'drizzle-orm';

async function trackArticleUsage(userId: string) {
  const now = new Date();
  const monthYear = now.toISOString().slice(0, 7);

  try {
    const result = await db
      .update(userUsage)
      .set({
        articlesPublished: sql`${userUsage.articlesPublished} + 1`,
        updatedAt: now,
      })
      .where(
        and(eq(userUsage.userId, userId), eq(userUsage.monthYear, monthYear))
      )
      .returning();

    if (!result.length) {
      await db.insert(userUsage).values({
        userId,
        monthYear,
        articlesPublished: 1,
      });
    }
  } catch (error) {
    logger.error('Failed to track article usage:', { error, userId });
  }
}

export async function publishToPlatforms(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = publishToPlatformsSchema.parse(input);
    const { draftId, platforms, options = {} } = validated;

    const [draft] = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, session.id)))
      .limit(1);

    if (!draft) {
      return errorResult('Draft not found');
    }

    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, session.id),
          eq(integrations.status, 'connected')
        )
      );

    const integrationMap = new Map(
      userIntegrations.map(integration => [integration.platform, integration])
    );

    const missingPlatforms = platforms.filter(
      platform => !integrationMap.has(platform)
    );

    if (missingPlatforms.length > 0) {
      return errorResult(
        `Not connected to: ${missingPlatforms.join(
          ', '
        )}. Please connect these platforms first.`
      );
    }

    for (const platform of platforms) {
      if (!checkPlatformRateLimit(platform, session.id)) {
        return errorResult(
          `Rate limit exceeded for ${platform}. Please try again later.`
        );
      }
    }

    const results: Array<{
      platform: string;
      success: boolean;
      platformPostId?: string;
      platformUrl?: string;
      error?: string;
    }> = [];

    for (const platform of platforms) {
      try {
        const titleValidation = validateTitle(draft.title, platform);
        if (!titleValidation.valid) {
          results.push({
            platform,
            success: false,
            error: titleValidation.error,
          });
          continue;
        }

        const integration = integrationMap.get(platform)!;
        const result = await publishToSinglePlatform(
          {
            ...draft,
            tags: draft.tags || [],
            platforms: draft.platforms || [],
            status: draft.status as 'draft' | 'scheduled' | 'published',
            contentPreview: draft.contentPreview || undefined,
            thumbnailUrl: draft.thumbnailUrl || undefined,
            seoTitle: draft.seoTitle || undefined,
            seoDescription: draft.seoDescription || undefined,
            publishedAt: draft.publishedAt || undefined,
            scheduledAt: draft.scheduledAt || undefined,
          },
          {
            platform: integration.platform,
            apiKey: integration.apiKey || undefined,
            accessToken: integration.accessToken || undefined,
            refreshToken: integration.refreshToken || undefined,
            publicationId: integration.publicationId || undefined,
          },
          options
        );
        results.push({ platform, success: true, ...result });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({ platform, success: false, error: errorMessage });
      }
    }

    const platformPostValues = results.map(result => ({
      draftId,
      platform: result.platform,
      platformPostId: result.platformPostId || null,
      platformUrl: result.platformUrl || null,
      status: result.success ? 'success' : 'failed',
      errorMessage: result.error || null,
      publishedAt: result.success ? new Date() : null,
    }));

    await db.insert(platformPosts).values(platformPostValues);

    const hasSuccess = results.some(r => r.success);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (hasSuccess) {
      await db
        .update(drafts)
        .set({
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(drafts.id, draftId))
        .returning();

      await trackArticleUsage(session.id);
    }

    if (!hasSuccess) {
      logger.info('No successful publishes, keeping draft status as draft');
      return;
    }

    revalidateDashboard();

    return successResult({
      results,
      summary: {
        total: platforms.length,
        successful: successCount,
        failed: failureCount,
        draftId,
      },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

async function publishToSinglePlatform(
  draft: Draft,
  integration: {
    platform: string;
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    publicationId?: string;
  },
  options: {
    publishAsDraft?: boolean;
    publicationId?: string;
    setAsCanonical?: boolean;
  }
): Promise<{ platformPostId: string; platformUrl: string }> {
  const mappedContent = mapContentForPlatform(draft, integration.platform, {
    publishAsDraft: options.publishAsDraft,
    publicationId: options.publicationId,
    setAsCanonical: options.setAsCanonical,
  });

  switch (integration.platform) {
    case 'devto':
      const devtoClient = createDevtoClient({
        apiKey: integration.apiKey!,
      });
      return await devtoClient.publish(mappedContent);

    case 'hashnode':
      const hashnodeClient = createHashnodeClient({
        apiKey: integration.apiKey!,
        publicationId: integration.publicationId,
      });
      return await hashnodeClient.publish(mappedContent);

    default:
      throw new Error(`Unsupported platform: ${integration.platform}`);
  }
}
