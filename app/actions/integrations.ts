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
    return errorResult(handleDatabaseError(error));
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

    if (existing) {
      return errorResult('Integration already exists for this platform');
    }

    const [integration] = await db
      .insert(integrations)
      .values({
        ...validated,
        userId: session.id,
        status: 'connected',
        connectedAt: new Date(),
      })
      .returning();

    revalidateDashboard();
    return successResult(integration);
  } catch (error) {
    return errorResult(handleDatabaseError(error));
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
    return errorResult(handleDatabaseError(error));
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
    return errorResult(handleDatabaseError(error));
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

    return successResult({
      success: true,
      message: `Connection test successful for ${integration.platform} (stub)`,
      platform: integration.platform,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
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

    await db
      .update(integrations)
      .set({
        lastSync: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, id));

    return successResult({
      synced: true,
      message: `Sync completed for ${integration.platform} (stub)`,
      platform: integration.platform,
      lastSync: new Date(),
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}
