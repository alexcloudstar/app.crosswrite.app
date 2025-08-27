'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { drafts, integrations, platformPosts } from '@/db/schema';
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

export async function publishToPlatforms(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = publishToPlatformsSchema.parse(input);
    const { draftId, platforms, options = {} } = validated;

    // Get the draft and verify ownership
    const [draft] = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, session.id)))
      .limit(1);

    if (!draft) {
      return errorResult('Draft not found');
    }

    // Get all integrations for the user
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

    // Validate that all requested platforms are connected
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

    // Check rate limits for all platforms
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

    // Publish to each platform
    for (const platform of platforms) {
      try {
        // Validate title length for this platform
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
            id: draft.id,
            title: draft.title,
            content: draft.content,
            tags: draft.tags || undefined,
            thumbnailUrl: draft.thumbnailUrl || undefined,
            seoTitle: draft.seoTitle || undefined,
            seoDescription: draft.seoDescription || undefined,
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

    // Update platform_posts table with results
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

    // Update draft status if any platform succeeded
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
        .where(eq(drafts.id, draftId));

      // TODO: Implement proper usage tracking
      // For now, just log the successful publish
      console.log(
        `Successfully published to ${successCount} platforms for user ${session.id}`
      );
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
  draft: {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    thumbnailUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
  },
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
  const mappedContent = mapContentForPlatform(
    {
      id: draft.id,
      title: draft.title,
      content: draft.content,
      tags: draft.tags || [],
      thumbnailUrl: draft.thumbnailUrl,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
    },
    integration.platform,
    {
      publishAsDraft: options.publishAsDraft,
      publicationId: options.publicationId,
      setAsCanonical: options.setAsCanonical,
    }
  );

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
