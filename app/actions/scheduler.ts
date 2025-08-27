'use server';

import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { scheduledPosts, drafts } from '@/db/schema';
import {
  requireAuth,
  successResult,
  errorResult,
  revalidateDashboard,
  handleDatabaseError,
} from './_utils';
import {
  createScheduledPostSchema,
  updateScheduledPostSchema,
  scheduledPostIdSchema,
} from '@/lib/validators/scheduler';

export async function listScheduledPosts() {
  try {
    const session = await requireAuth();

    const results = await db
      .select({
        id: scheduledPosts.id,
        draftId: scheduledPosts.draftId,
        platforms: scheduledPosts.platforms,
        scheduledAt: scheduledPosts.scheduledAt,
        status: scheduledPosts.status,
        publishedAt: scheduledPosts.publishedAt,
        errorMessage: scheduledPosts.errorMessage,
        createdAt: scheduledPosts.createdAt,
        draftTitle: drafts.title,
        draftStatus: drafts.status,
      })
      .from(scheduledPosts)
      .innerJoin(drafts, eq(scheduledPosts.draftId, drafts.id))
      .where(eq(scheduledPosts.userId, session.id))
      .orderBy(desc(scheduledPosts.scheduledAt));

    return successResult(results);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function createScheduledPost(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = createScheduledPostSchema.parse(input) as {
      draftId: string;
      platforms: string[];
      scheduledAt: string;
    };

    const [draft] = await db
      .select()
      .from(drafts)
      .where(
        and(eq(drafts.id, validated.draftId), eq(drafts.userId, session.id))
      )
      .limit(1);

    if (!draft) {
      return errorResult('Draft not found');
    }

    const [existing] = await db
      .select()
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.draftId, validated.draftId),
          eq(scheduledPosts.userId, session.id),
          eq(scheduledPosts.status, 'pending')
        )
      )
      .limit(1);

    if (existing) {
      return errorResult('Draft is already scheduled');
    }

    const [scheduledPost] = await db
      .insert(scheduledPosts)
      .values({
        ...validated,
        userId: session.id,
        scheduledAt: new Date(validated.scheduledAt),
      })
      .returning();

    revalidateDashboard();
    return successResult(scheduledPost);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function updateScheduledPost(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = updateScheduledPostSchema.parse(input) as {
      id: string;
      platforms?: string[];
      scheduledAt?: string;
      status?: 'pending' | 'published' | 'cancelled' | 'failed';
    };
    const { id, ...updateData } = validated;

    const [existing] = await db
      .select()
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.id, id),
          eq(scheduledPosts.userId, session.id),
          eq(scheduledPosts.status, 'pending')
        )
      )
      .limit(1);

    if (!existing) {
      return errorResult('Scheduled post not found or cannot be updated');
    }

    const updateValues: Record<string, unknown> = {};
    if (updateData.platforms) {
      updateValues.platforms = updateData.platforms;
    }
    if (updateData.scheduledAt) {
      updateValues.scheduledAt = new Date(updateData.scheduledAt);
    }
    if (updateData.status) {
      updateValues.status = updateData.status;
    }

    const [scheduledPost] = await db
      .update(scheduledPosts)
      .set(updateValues)
      .where(eq(scheduledPosts.id, id))
      .returning();

    revalidateDashboard();
    return successResult(scheduledPost);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function cancelScheduledPost(input: unknown) {
  try {
    const session = await requireAuth();
    const { id } = scheduledPostIdSchema.parse(input) as { id: string };

    const [scheduledPost] = await db
      .update(scheduledPosts)
      .set({
        status: 'cancelled',
      })
      .where(
        and(
          eq(scheduledPosts.id, id),
          eq(scheduledPosts.userId, session.id),
          eq(scheduledPosts.status, 'pending')
        )
      )
      .returning();

    if (!scheduledPost) {
      return errorResult('Scheduled post not found or cannot be cancelled');
    }

    revalidateDashboard();
    return successResult({ cancelled: true });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}
