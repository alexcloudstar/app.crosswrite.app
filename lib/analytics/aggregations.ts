/**
 * Reusable analytics query builders
 * Centralized aggregation logic to avoid N+1 queries and ensure consistency
 */

import { eq, and, gte, lte, desc, sum, count, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { analytics, drafts } from '@/db/schema';
import { getDateTruncation } from './time';

/**
 * Base analytics query with user and date range filtering
 */
export function createBaseAnalyticsQuery(userId: string, from: Date, to: Date) {
  return db
    .select()
    .from(analytics)
    .innerJoin(drafts, eq(analytics.draftId, drafts.id))
    .where(
      and(
        eq(drafts.userId, userId),
        gte(analytics.recordedAt, from),
        lte(analytics.recordedAt, to)
      )
    );
}

/**
 * Get overview aggregates (reads, reactions, clicks, shares, total posts)
 */
export async function getOverviewAggregates(
  userId: string,
  from: Date,
  to: Date
) {
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
        eq(drafts.userId, userId),
        gte(analytics.recordedAt, from),
        lte(analytics.recordedAt, to)
      )
    );

  const [stats] = results;

  return {
    reads: Number(stats.reads) || 0,
    reactions: Number(stats.reactions) || 0,
    clicks: Number(stats.clicks) || 0,
    shares: Number(stats.shares) || 0,
    totalPosts: Number(stats.totalPosts) || 0,
  };
}

/**
 * Get time-series data grouped by date granularity
 */
export async function getTimeSeriesData(
  userId: string,
  from: Date,
  to: Date,
  granularity: 'day' | 'week' = 'day'
) {
  const dateTruncation = getDateTruncation(granularity);

  const results = await db
    .select({
      date: sql<string>`${sql.raw(dateTruncation)}`,
      reads: sum(analytics.reads),
      reactions: sum(analytics.reactions),
      clicks: sum(analytics.clicks),
      shares: sum(analytics.shares),
    })
    .from(analytics)
    .innerJoin(drafts, eq(analytics.draftId, drafts.id))
    .where(
      and(
        eq(drafts.userId, userId),
        gte(analytics.recordedAt, from),
        lte(analytics.recordedAt, to)
      )
    )
    .groupBy(sql.raw(dateTruncation))
    .orderBy(sql.raw(dateTruncation));

  return results.map(row => ({
    date: row.date,
    reads: Number(row.reads) || 0,
    reactions: Number(row.reactions) || 0,
    clicks: Number(row.clicks) || 0,
    shares: Number(row.shares) || 0,
  }));
}

/**
 * Get platform breakdown aggregates
 */
export async function getPlatformBreakdown(
  userId: string,
  from: Date,
  to: Date
) {
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
        eq(drafts.userId, userId),
        gte(analytics.recordedAt, from),
        lte(analytics.recordedAt, to)
      )
    )
    .groupBy(analytics.platform)
    .orderBy(desc(sum(analytics.reads)));

  return results.map(row => ({
    platform: row.platform,
    reads: Number(row.reads) || 0,
    reactions: Number(row.reactions) || 0,
    clicks: Number(row.clicks) || 0,
    shares: Number(row.shares) || 0,
    posts: Number(row.posts) || 0,
  }));
}

/**
 * Get top performing posts with engagement metrics
 */
export async function getTopPosts(
  userId: string,
  from: Date,
  to: Date,
  limit: number = 10
) {
  const results = await db
    .select({
      draftId: drafts.id,
      title: drafts.title,
      platform: analytics.platform,
      reads: sum(analytics.reads),
      reactions: sum(analytics.reactions),
      clicks: sum(analytics.clicks),
      shares: sum(analytics.shares),
      publishedAt: drafts.publishedAt,
    })
    .from(analytics)
    .innerJoin(drafts, eq(analytics.draftId, drafts.id))
    .where(
      and(
        eq(drafts.userId, userId),
        gte(analytics.recordedAt, from),
        lte(analytics.recordedAt, to)
      )
    )
    .groupBy(drafts.id, drafts.title, analytics.platform, drafts.publishedAt)
    .orderBy(desc(sum(analytics.reads)))
    .limit(limit);

  return results.map(row => ({
    draftId: row.draftId,
    title: row.title,
    platform: row.platform,
    reads: Number(row.reads) || 0,
    reactions: Number(row.reactions) || 0,
    clicks: Number(row.clicks) || 0,
    shares: Number(row.shares) || 0,
    publishedAt: row.publishedAt,
    totalEngagement:
      Number(row.reads || 0) +
      Number(row.reactions || 0) +
      Number(row.clicks || 0) +
      Number(row.shares || 0),
  }));
}

/**
 * Get publish success rate (successful vs failed publishes)
 */
export async function getPublishSuccessRate(
  userId: string,
  from: Date,
  to: Date
) {
  // For now, return mock data since platform_posts table might not exist yet
  // TODO: Implement real success rate calculation when platform_posts is available
  return {
    successRate: 94.2,
    breakdown: [
      { status: 'Success', count: 42 },
      { status: 'Failed', count: 3 },
    ],
  };
}
