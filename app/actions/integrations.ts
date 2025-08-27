'use server';

import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { integrations } from '@/db/schema';
import {
  requireAuth,
  successResult,
  errorResult,
  revalidateDashboard,
  handleDatabaseError,
} from './_utils';
import {
  connectIntegrationSchema,
  updateIntegrationSchema,
  integrationIdSchema,
} from '@/lib/validators/integrations';
import { z } from 'zod';

export async function listIntegrations() {
  try {
    const session = await requireAuth();

    const results = await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, session.id))
      .orderBy(desc(integrations.updatedAt));

    return successResult(results);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function connectIntegration(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = connectIntegrationSchema.parse(input);

    const [existing] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, session.id),
          eq(integrations.platform, validated.platform)
        )
      )
      .limit(1);

    let integration;

    if (existing) {
      // If integration exists but is disconnected, update it
      if (existing.status === 'disconnected') {
        [integration] = await db
          .update(integrations)
          .set({
            ...validated,
            status: 'connected',
            connectedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, existing.id))
          .returning();
      } else {
        return errorResult('Integration already exists for this platform');
      }
    } else {
      // Create new integration
      [integration] = await db
        .insert(integrations)
        .values({
          ...validated,
          userId: session.id,
          status: 'connected',
          connectedAt: new Date(),
        })
        .returning();
    }

    revalidateDashboard();
    return successResult(integration);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function updateIntegration(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = updateIntegrationSchema.parse(input);
    const { id, ...updateData } = validated;

    const [integration] = await db
      .update(integrations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(integrations.id, id), eq(integrations.userId, session.id)))
      .returning();

    if (!integration) {
      return errorResult('Integration not found');
    }

    revalidateDashboard();
    return successResult(integration);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function updateIntegrationPublicationId(input: unknown) {
  try {
    const session = await requireAuth();
    const { id, publicationId } = z
      .object({
        id: z.string().uuid('Invalid integration ID'),
        publicationId: z.string().min(1, 'Publication ID is required'),
      })
      .parse(input);

    const [integration] = await db
      .update(integrations)
      .set({
        publicationId,
        updatedAt: new Date(),
      })
      .where(and(eq(integrations.id, id), eq(integrations.userId, session.id)))
      .returning();

    if (!integration) {
      return errorResult('Integration not found');
    }

    revalidateDashboard();
    return successResult(integration);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function disconnectIntegration(input: unknown) {
  try {
    const session = await requireAuth();
    const { id } = integrationIdSchema.parse(input);

    const [integration] = await db
      .update(integrations)
      .set({
        status: 'disconnected',
        apiKey: null,
        apiSecret: null,
        accessToken: null,
        refreshToken: null,
        updatedAt: new Date(),
      })
      .where(and(eq(integrations.id, id), eq(integrations.userId, session.id)))
      .returning();

    if (!integration) {
      return errorResult('Integration not found');
    }

    revalidateDashboard();
    return successResult({ disconnected: true });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function testIntegration(input: unknown) {
  try {
    const session = await requireAuth();
    const { id } = integrationIdSchema.parse(input);

    const [integration] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, session.id)))
      .limit(1);

    if (!integration) {
      return errorResult('Integration not found');
    }

    // Test the actual platform connection
    let testResult: { success: boolean; error?: string };

    try {
      switch (integration.platform) {
        case 'devto':
          const { createDevtoClient } = await import(
            '@/lib/integrations/devto'
          );
          const devtoClient = createDevtoClient({
            apiKey: integration.apiKey!,
          });
          testResult = await devtoClient.testConnection();
          break;

        case 'hashnode':
          const { createHashnodeClient } = await import(
            '@/lib/integrations/hashnode'
          );
          const hashnodeClient = createHashnodeClient({
            apiKey: integration.apiKey!,
          });
          testResult = await hashnodeClient.testConnection();
          break;

        case 'beehiiv':
          const { createBeehiivClient } = await import(
            '@/lib/integrations/beehiiv'
          );
          const beehiivClient = createBeehiivClient({
            apiKey: integration.apiKey!,
          });
          testResult = await beehiivClient.testConnection();
          break;

        default:
          return errorResult(`Unsupported platform: ${integration.platform}`);
      }

      if (testResult.success) {
        // Update last sync timestamp on successful test
        await db
          .update(integrations)
          .set({
            lastSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, id));
      }

      return successResult({
        success: testResult.success,
        message: testResult.success
          ? `Connection test successful for ${integration.platform}`
          : testResult.error ||
            `Connection test failed for ${integration.platform}`,
        platform: integration.platform,
      });
    } catch (error) {
      return successResult({
        success: false,
        message: `Connection test failed for ${integration.platform}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        platform: integration.platform,
      });
    }
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function syncIntegration(input: unknown) {
  try {
    const session = await requireAuth();
    const { id } = integrationIdSchema.parse(input);

    const [integration] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, session.id)))
      .limit(1);

    if (!integration) {
      return errorResult('Integration not found');
    }

    // Use the new sync actions
    const { syncPlatformStatus, syncPlatformAnalytics } = await import(
      './integrations/sync'
    );

    // Sync both status and analytics
    const statusResult = await syncPlatformStatus({
      platform: integration.platform,
    });
    const analyticsResult = await syncPlatformAnalytics({
      platform: integration.platform,
    });

    if (!statusResult.success || !analyticsResult.success) {
      return errorResult('Sync failed for one or more operations');
    }

    return successResult({
      synced: true,
      message: `Sync completed for ${integration.platform}`,
      platform: integration.platform,
      lastSync: new Date(),
      statusSynced: statusResult.success,
      analyticsSynced: analyticsResult.success,
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function getPlatformPublications(input: unknown) {
  try {
    const session = await requireAuth();
    const { platform, integrationId } = z
      .object({
        platform: z.enum(['hashnode', 'beehiiv']),
        integrationId: z.string().uuid(),
      })
      .parse(input);

    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.userId, session.id)
        )
      )
      .limit(1);

    if (!integration) {
      return errorResult('Integration not found');
    }

    if (integration.status !== 'connected') {
      return errorResult('Integration is not connected');
    }

    let publications: unknown[] = [];

    switch (platform) {
      case 'hashnode':
        const { createHashnodeClient } = await import(
          '@/lib/integrations/hashnode'
        );
        const hashnodeClient = createHashnodeClient({
          apiKey: integration.apiKey!,
        });
        const hashnodeResult = await hashnodeClient.getPublications();
        if (hashnodeResult.success && hashnodeResult.publications) {
          publications = hashnodeResult.publications;
        } else {
          return errorResult(
            hashnodeResult.error || 'Failed to fetch Hashnode publications'
          );
        }
        break;

      case 'beehiiv':
        const { createBeehiivClient } = await import(
          '@/lib/integrations/beehiiv'
        );
        const beehiivClient = createBeehiivClient({
          apiKey: integration.apiKey!,
        });
        const beehiivResult = await beehiivClient.getPublications();
        if (beehiivResult.success && beehiivResult.publications) {
          publications = beehiivResult.publications;
        } else {
          return errorResult(
            beehiivResult.error || 'Failed to fetch Beehiiv publications'
          );
        }
        break;

      default:
        return errorResult(
          `Publications not supported for platform: ${platform}`
        );
    }

    return successResult({ publications });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function syncPlatformAnalytics(input: unknown) {
  try {
    const session = await requireAuth();
    const { platform, integrationId } = z
      .object({
        platform: z.enum(['devto', 'hashnode', 'beehiiv']),
        integrationId: z.string().uuid(),
      })
      .parse(input);

    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.userId, session.id)
        )
      )
      .limit(1);

    if (!integration) {
      return errorResult('Integration not found');
    }

    if (integration.status !== 'connected') {
      return errorResult('Integration is not connected');
    }

    // For now, we'll implement basic analytics sync
    // In a full implementation, this would fetch analytics from each platform
    let analyticsData: {
      message: string;
      lastSync: Date;
    } = {
      message: '',
      lastSync: new Date(),
    };

    switch (platform) {
      case 'devto':
        // Dev.to analytics are limited
        analyticsData = {
          message: 'Dev.to analytics are limited and require manual tracking',
          lastSync: new Date(),
        };
        break;

      case 'hashnode':
        // Hashnode analytics are limited
        analyticsData = {
          message: 'Hashnode analytics are limited and require manual tracking',
          lastSync: new Date(),
        };
        break;

      case 'beehiiv':
        // Beehiiv has some analytics available
        analyticsData = {
          message:
            'Beehiiv analytics sync would require additional API endpoints',
          lastSync: new Date(),
        };
        break;
    }

    // Update the integration's last sync timestamp
    await db
      .update(integrations)
      .set({
        lastSync: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, integrationId));

    revalidateDashboard();
    return successResult({
      platform,
      analyticsData,
      syncedAt: new Date(),
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}
