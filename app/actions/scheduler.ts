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
import { toUTC } from '@/lib/scheduler/time';
import { processDueJobs } from '@/lib/scheduler/engine';

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
        retryCount: scheduledPosts.retryCount,
        createdAt: scheduledPosts.createdAt,
        updatedAt: scheduledPosts.updatedAt,
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
      userTz?: string;
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

    const scheduledAtUTC = toUTC(
      new Date(validated.scheduledAt),
      validated.userTz
    );

    const [scheduledPost] = await db
      .insert(scheduledPosts)
      .values({
        draftId: validated.draftId,
        platforms: validated.platforms,
        userId: session.id,
        scheduledAt: scheduledAtUTC,
      })
      .returning();

    await db
      .update(drafts)
      .set({
        status: 'scheduled',
        scheduledAt: scheduledAtUTC,
        updatedAt: new Date(),
      })
      .where(eq(drafts.id, validated.draftId));

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
      userTz?: string;
    };
    const { id, userTz, ...updateData } = validated;

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

    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updateData.platforms) {
      updateValues.platforms = updateData.platforms;
    }
    if (updateData.scheduledAt) {
      const scheduledAtUTC = toUTC(new Date(updateData.scheduledAt), userTz);
      updateValues.scheduledAt = scheduledAtUTC;
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
        updatedAt: new Date(),
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

    await db
      .update(drafts)
      .set({
        status: 'draft',
        scheduledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(drafts.id, scheduledPost.draftId));

    revalidateDashboard();
    return successResult({ cancelled: true });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function bulkSchedule(input: unknown) {
  try {
    const session = await requireAuth();
    const { schedules } = input as {
      schedules: Array<{
        draftId: string;
        platforms: string[];
        scheduledAt: string;
        userTz?: string;
      }>;
    };

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return errorResult('No schedules provided');
    }

    if (schedules.length > 10) {
      return errorResult('Maximum 10 schedules allowed per bulk operation');
    }

    const results: Array<{
      success: boolean;
      draftId: string;
      error?: string;
    }> = [];

    for (const schedule of schedules) {
      try {
        const validated = createScheduledPostSchema.parse(schedule);

        const [draft] = await db
          .select()
          .from(drafts)
          .where(
            and(eq(drafts.id, validated.draftId), eq(drafts.userId, session.id))
          )
          .limit(1);

        if (!draft) {
          results.push({
            success: false,
            draftId: validated.draftId,
            error: 'Draft not found',
          });
          continue;
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
          if (draft.status !== 'scheduled') {
            await db
              .update(drafts)
              .set({
                status: 'scheduled',
                scheduledAt: existing.scheduledAt,
                updatedAt: new Date(),
              })
              .where(eq(drafts.id, validated.draftId));

            results.push({
              success: true,
              draftId: validated.draftId,
            });
          } else {
            results.push({
              success: false,
              draftId: validated.draftId,
              error: 'Draft is already scheduled',
            });
          }
          continue;
        }

        const scheduledAtUTC = toUTC(
          new Date(validated.scheduledAt),
          schedule.userTz
        );

        await db.insert(scheduledPosts).values({
          draftId: validated.draftId,
          platforms: validated.platforms,
          userId: session.id,
          scheduledAt: scheduledAtUTC,
        });

        await db
          .update(drafts)
          .set({
            status: 'scheduled',
            scheduledAt: scheduledAtUTC,
            updatedAt: new Date(),
          })
          .where(eq(drafts.id, validated.draftId));

        results.push({
          success: true,
          draftId: validated.draftId,
        });
      } catch (error) {
        results.push({
          success: false,
          draftId: schedule.draftId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    revalidateDashboard();

    return successResult({
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function processDueJobsAction() {
  try {
    const result = await processDueJobs();

    return successResult(result);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function resetScheduledPost(input: { draftId: string }) {
  try {
    const session = await requireAuth();
    const { draftId } = input;

    await db
      .delete(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.draftId, draftId),
          eq(scheduledPosts.userId, session.id)
        )
      );

    await db
      .update(drafts)
      .set({
        status: 'draft',
        scheduledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(drafts.id, draftId));

    revalidateDashboard();
    return successResult({ reset: true });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}
