'use server';

import { eq, and, desc, like, or, count } from 'drizzle-orm';
import { db } from '@/db/client';
import { drafts } from '@/db/schema';
import {
  requireAuth,
  successResult,
  errorResult,
  revalidateDashboard,
  handleDatabaseError,
} from './_utils';
import {
  createDraftSchema,
  updateDraftSchema,
  listDraftsSchema,
  publishDraftSchema,
  scheduleDraftSchema,
  draftIdSchema,
} from '@/lib/validators/drafts';

export async function listDrafts(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = listDraftsSchema.parse(input);

    const { page, limit, status, search } = validated;
    const offset = (page - 1) * limit;

    const conditions = [eq(drafts.userId, session.id)];

    if (status) {
      conditions.push(eq(drafts.status, status));
    }
    if (search) {
      const searchCondition = or(
        like(drafts.title, `%${search}%`),
        like(drafts.content, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = and(...conditions);

    const results = await db
      .select()
      .from(drafts)
      .where(whereClause)
      .orderBy(desc(drafts.updatedAt))
      .limit(limit)
      .offset(offset);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(drafts)
      .where(whereClause);

    return successResult({
      drafts: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function createDraft(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = createDraftSchema.parse(input);

    const [draft] = await db
      .insert(drafts)
      .values({
        ...validated,
        userId: session.id,
      })
      .returning();

    revalidateDashboard();
    return successResult(draft);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function getDraft(input: unknown) {
  try {
    const session = await requireAuth();
    const { id } = draftIdSchema.parse(input);

    const [draft] = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, id), eq(drafts.userId, session.id)))
      .limit(1);

    if (!draft) {
      return errorResult('Draft not found');
    }

    return successResult(draft);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function updateDraft(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = updateDraftSchema.parse(input);
    const { id, ...updateData } = validated;

    const [draft] = await db
      .update(drafts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(drafts.id, id), eq(drafts.userId, session.id)))
      .returning();

    if (!draft) {
      return errorResult('Draft not found');
    }

    revalidateDashboard();
    return successResult(draft);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function deleteDraft(input: unknown) {
  try {
    const session = await requireAuth();
    const { id } = draftIdSchema.parse(input);

    const [draft] = await db
      .delete(drafts)
      .where(and(eq(drafts.id, id), eq(drafts.userId, session.id)))
      .returning();

    if (!draft) {
      return errorResult('Draft not found');
    }

    revalidateDashboard();
    return successResult({ deleted: true });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function publishDraft(input: unknown) {
  try {
    const { draftId, platforms } = publishDraftSchema.parse(input);

    const { publishToPlatforms } = await import('./integrations/publish');

    return await publishToPlatforms({
      draftId,
      platforms,
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function scheduleDraft(input: unknown) {
  try {
    const session = await requireAuth();
    const { draftId, scheduledAt } = scheduleDraftSchema.parse(input);

    const [draft] = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, session.id)))
      .limit(1);

    if (!draft) {
      return errorResult('Draft not found');
    }

    const [updatedDraft] = await db
      .update(drafts)
      .set({
        status: 'scheduled',
        scheduledAt: new Date(scheduledAt),
        updatedAt: new Date(),
      })
      .where(eq(drafts.id, draftId))
      .returning();

    revalidateDashboard();
    return successResult({
      draft: updatedDraft,
      message: 'Draft scheduled successfully (stub - no actual scheduling)',
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}
