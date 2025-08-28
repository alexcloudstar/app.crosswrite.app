'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { integrations } from '@/db/schema';
import {
  requireAuth,
  successResult,
  errorResult,
  revalidateDashboard,
  handleDatabaseError,
} from '../_utils';
import { syncPlatformSchema } from '@/lib/validators/integrations';
import { checkPlatformRateLimit } from '@/lib/integrations/_core';

export async function syncPlatformStatus(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = syncPlatformSchema.parse(input);
    const { platform } = validated;

    const whereConditions = [
      eq(integrations.userId, session.id),
      eq(integrations.status, 'connected'),
    ];

    if (platform) {
      whereConditions.push(eq(integrations.platform, platform));
    }

    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(and(...whereConditions));

    if (userIntegrations.length === 0) {
      return errorResult('No connected integrations found');
    }

    for (const integration of userIntegrations) {
      if (!checkPlatformRateLimit(integration.platform, session.id)) {
        return errorResult(
          `Rate limit exceeded for ${integration.platform}. Please try again later.`
        );
      }
    }

    const results: Array<{
      platform: string;
      success: boolean;
      syncedCount: number;
      error?: string;
    }> = [];

    for (const integration of userIntegrations) {
      try {
        // TODO: Implement actual status sync for each platform
        // For now, just update the last sync timestamp
        await db
          .update(integrations)
          .set({
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));

        results.push({
          platform: integration.platform,
          success: true,
          syncedCount: 0, // TODO: Return actual synced count
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({
          platform: integration.platform,
          success: false,
          syncedCount: 0,
          error: errorMessage,
        });
      }
    }

    revalidateDashboard();

    const successCount = results.filter(r => r.success).length;
    const totalSynced = results.reduce((sum, r) => sum + r.syncedCount, 0);

    return successResult({
      results,
      summary: {
        total: userIntegrations.length,
        successful: successCount,
        failed: userIntegrations.length - successCount,
        totalSynced,
      },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function syncAllPlatforms() {
  try {
    const session = await requireAuth();

    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, session.id),
          eq(integrations.status, 'connected')
        )
      );

    if (userIntegrations.length === 0) {
      return errorResult('No connected integrations found');
    }

    for (const integration of userIntegrations) {
      if (!checkPlatformRateLimit(integration.platform, session.id)) {
        return errorResult(
          `Rate limit exceeded for ${integration.platform}. Please try again later.`
        );
      }
    }

    const results: Array<{
      platform: string;
      statusSynced: boolean;
      error?: string;
    }> = [];

    for (const integration of userIntegrations) {
      try {
        // TODO: Implement actual sync for each platform
        // For now, just update the last sync timestamp
        await db
          .update(integrations)
          .set({
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));

        results.push({
          platform: integration.platform,
          statusSynced: true,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({
          platform: integration.platform,
          statusSynced: false,
          error: errorMessage,
        });
      }
    }

    revalidateDashboard();

    const successCount = results.filter(r => r.statusSynced).length;

    return successResult({
      results,
      summary: {
        total: userIntegrations.length,
        successful: successCount,
        failed: userIntegrations.length - successCount,
      },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}
