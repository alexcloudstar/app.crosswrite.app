'use server';

import { eq, and, gte, lte, desc, sum, count } from 'drizzle-orm';
import { db } from '@/db/client';
import { analytics, drafts } from '@/db/schema';
import {
  requireAuth,
  successResult,
  errorResult,
  handleDatabaseError,
} from './_utils';
import { analyticsRangeSchema } from '@/lib/validators/analytics';

export async function getOverview(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeSchema.parse(input);

    const { startDate, endDate } = validated;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await db
      .select({
        reads: sum(analytics.reads),
        reactions: sum(analytics.reactions),
        clicks: sum(analytics.clicks),
        shares: sum(analytics.shares),
        totalPosts: count(analytics.id),
      })
      .from(analytics)
      .innerJoin(drafts, eq(analytics.draftId, drafts.id))
      .where(
        and(
          eq(drafts.userId, session.id),
          gte(analytics.recordedAt, start),
          lte(analytics.recordedAt, end)
        )
      );

    const [stats] = results;

    return successResult({
      reads: Number(stats.reads) || 0,
      reactions: Number(stats.reactions) || 0,
      clicks: Number(stats.clicks) || 0,
      shares: Number(stats.shares) || 0,
      totalPosts: Number(stats.totalPosts) || 0,
      period: { startDate, endDate },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function getReadsOverTime(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeSchema.parse(input);

    const { startDate, endDate } = validated;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await db
      .select({
        date: analytics.recordedAt,
        reads: sum(analytics.reads),
      })
      .from(analytics)
      .innerJoin(drafts, eq(analytics.draftId, drafts.id))
      .where(
        and(
          eq(drafts.userId, session.id),
          gte(analytics.recordedAt, start),
          lte(analytics.recordedAt, end)
        )
      )
      .groupBy(analytics.recordedAt)
      .orderBy(analytics.recordedAt);

    return successResult({
      data: results.map(row => ({
        date: row.date,
        reads: Number(row.reads) || 0,
      })),
      period: { startDate, endDate },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function getPlatformBreakdown(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeSchema.parse(input);

    const { startDate, endDate } = validated;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await db
      .select({
        platform: analytics.platform,
        reads: sum(analytics.reads),
        reactions: sum(analytics.reactions),
        clicks: sum(analytics.clicks),
        shares: sum(analytics.shares),
        posts: count(analytics.id),
      })
      .from(analytics)
      .innerJoin(drafts, eq(analytics.draftId, drafts.id))
      .where(
        and(
          eq(drafts.userId, session.id),
          gte(analytics.recordedAt, start),
          lte(analytics.recordedAt, end)
        )
      )
      .groupBy(analytics.platform)
      .orderBy(desc(sum(analytics.reads)));

    return successResult({
      platforms: results.map(row => ({
        platform: row.platform,
        reads: Number(row.reads) || 0,
        reactions: Number(row.reactions) || 0,
        clicks: Number(row.clicks) || 0,
        shares: Number(row.shares) || 0,
        posts: Number(row.posts) || 0,
      })),
      period: { startDate, endDate },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function getTopPosts(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeSchema.parse(input);

    const { startDate, endDate } = validated;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await db
      .select({
        draftId: drafts.id,
        title: drafts.title,
        platform: analytics.platform,
        reads: sum(analytics.reads),
        reactions: sum(analytics.reactions),
        clicks: sum(analytics.clicks),
        shares: sum(analytics.shares),
      })
      .from(analytics)
      .innerJoin(drafts, eq(analytics.draftId, drafts.id))
      .where(
        and(
          eq(drafts.userId, session.id),
          gte(analytics.recordedAt, start),
          lte(analytics.recordedAt, end)
        )
      )
      .groupBy(drafts.id, drafts.title, analytics.platform)
      .orderBy(desc(sum(analytics.reads)))
      .limit(10);

    return successResult({
      posts: results.map(row => ({
        draftId: row.draftId,
        title: row.title,
        platform: row.platform,
        reads: Number(row.reads) || 0,
        reactions: Number(row.reactions) || 0,
        clicks: Number(row.clicks) || 0,
        shares: Number(row.shares) || 0,
        totalEngagement:
          Number(row.reads || 0) +
          Number(row.reactions || 0) +
          Number(row.clicks || 0) +
          Number(row.shares || 0),
      })),
      period: { startDate, endDate },
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

export async function syncAnalytics() {
  try {
    await requireAuth();

    return successResult({
      synced: true,
      message: 'Analytics sync completed (stub - no actual sync)',
      timestamp: new Date(),
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}
