'use server';

import {
  requireAuth,
  successResult,
  errorResult,
  handleDatabaseError,
} from './_utils';
import {
  analyticsRangeExtendedSchema,
  analyticsExportSchema,
} from '@/lib/validators/analytics';
import { parseDateRange, formatDateForDisplay } from '@/lib/analytics/time';
import {
  generateCacheKey,
  getCachedData,
  setCachedData,
} from '@/lib/analytics/cache';
import {
  getOverviewAggregates,
  getTimeSeriesData,
  getPlatformBreakdown as getPlatformBreakdownData,
  getTopPosts as getTopPostsData,
  getPublishSuccessRate as getPublishSuccessRateData,
} from '@/lib/analytics/aggregations';

/**
 * Get overview analytics with caching
 * Returns aggregated reads, clicks, shares, reactions for the user within range
 */
export async function getOverview(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeExtendedSchema.parse(input);

    const { from, to, granularity } = parseDateRange(validated);
    const cacheKey = generateCacheKey(
      session.id,
      'overview',
      from,
      to,
      granularity
    );

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log('Returning cached analytics data:', cached);
      return successResult(cached);
    }

    const stats = await getOverviewAggregates(session.id, from, to);
    console.log('Raw database stats:', stats);

    // Calculate derived metrics
    const ctr = stats.reads > 0 ? (stats.clicks / stats.reads) * 100 : 0;
    const avgReadTime = stats.reads > 0 ? 4.5 : 0; // TODO: Calculate from actual data

    const result = {
      ...stats,
      ctr: Math.round(ctr * 100) / 100, // Round to 2 decimal places
      avgReadTime: Math.round(avgReadTime * 10) / 10, // Round to 1 decimal place
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity,
      },
    };

    console.log('Final analytics result:', result);

    // Cache for 2 minutes
    setCachedData(cacheKey, result, 120000);

    return successResult(result);
  } catch (error) {
    console.error('Analytics overview error:', error);
    return errorResult(await handleDatabaseError(error));
  }
}

/**
 * Get reads over time with time-series grouping
 * Returns time-series data grouped by day or week
 */
export async function getReadsOverTime(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeExtendedSchema.parse(input);

    const { from, to, granularity } = parseDateRange(validated);
    const cacheKey = generateCacheKey(
      session.id,
      'reads-over-time',
      from,
      to,
      granularity
    );

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return successResult(cached);
    }

    const timeSeriesData = await getTimeSeriesData(
      session.id,
      from,
      to,
      granularity
    );

    // Format dates for display
    const formattedData = timeSeriesData.map(item => ({
      date: formatDateForDisplay(new Date(item.date)),
      reads: item.reads,
      clicks: item.clicks,
      reactions: item.reactions,
      shares: item.shares,
    }));

    const result = {
      data: formattedData,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity,
      },
    };

    // Cache for 2 minutes
    setCachedData(cacheKey, result, 120000);

    return successResult(result);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

/**
 * Get platform breakdown with per-platform aggregates
 * Returns sorted platform data by reads (descending)
 */
export async function getPlatformBreakdown(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeExtendedSchema.parse(input);

    const { from, to, granularity } = parseDateRange(validated);
    const cacheKey = generateCacheKey(
      session.id,
      'platform-breakdown',
      from,
      to,
      granularity
    );

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return successResult(cached);
    }

    const platforms = await getPlatformBreakdownData(session.id, from, to);

    const result = {
      platforms,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity,
      },
    };

    // Cache for 2 minutes
    setCachedData(cacheKey, result, 120000);

    return successResult(result);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

/**
 * Get top performing posts with engagement metrics
 * Returns top posts by reads with draft titles and platform info
 */
export async function getTopPosts(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeExtendedSchema.parse(input);

    const { from, to, granularity } = parseDateRange(validated);
    const limit = 10; // Default limit
    const cacheKey = generateCacheKey(
      session.id,
      'top-posts',
      from,
      to,
      granularity
    );

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return successResult(cached);
    }

    const posts = await getTopPostsData(session.id, from, to, limit);

    const result = {
      posts,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity,
      },
    };

    // Cache for 2 minutes
    setCachedData(cacheKey, result, 120000);

    return successResult(result);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

/**
 * Get publish success rate and breakdown
 * Returns success rate percentage and status breakdown
 */
export async function getPublishSuccessRate(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsRangeExtendedSchema.parse(input);

    const { from, to, granularity } = parseDateRange(validated);
    const cacheKey = generateCacheKey(
      session.id,
      'publish-success',
      from,
      to,
      granularity
    );

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return successResult(cached);
    }

    const successData = await getPublishSuccessRateData(session.id, from, to);

    const result = {
      successRate: Math.round(successData.successRate * 100) / 100,
      breakdown: successData.breakdown,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity,
      },
    };

    // Cache for 2 minutes
    setCachedData(cacheKey, result, 120000);

    return successResult(result);
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

/**
 * Export analytics data as CSV or JSON
 * Returns formatted data for download
 */
export async function exportAnalytics(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyticsExportSchema.parse(input);

    const { view, format, range } = validated;
    const { from, to, granularity } = parseDateRange(range || {});

    let data: unknown;

    switch (view) {
      case 'overview':
        data = await getOverviewAggregates(session.id, from, to);
        break;
      case 'reads':
        data = await getTimeSeriesData(session.id, from, to, granularity);
        break;
      case 'platforms':
        data = await getPlatformBreakdownData(session.id, from, to);
        break;
      case 'posts':
        data = await getTopPostsData(session.id, from, to, 100); // Export more posts
        break;
      default:
        throw new Error('Invalid view type');
    }

    if (format === 'csv') {
      const csv = convertToCSV(data, view);
      return successResult({
        data: csv,
        filename: `analytics-${view}-${from.toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv',
      });
    } else {
      return successResult({
        data: JSON.stringify(data, null, 2),
        filename: `analytics-${view}-${from.toISOString().split('T')[0]}.json`,
        contentType: 'application/json',
      });
    }
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

/**
 * Sync analytics from platforms (stub implementation)
 * In production, this would sync from connected platform APIs
 */
export async function syncAnalytics() {
  try {
    // TODO: Implement actual platform sync
    // This would iterate through user's connected integrations
    // and fetch analytics data from platform APIs

    return successResult({
      synced: true,
      message: 'Analytics sync completed (stub - no actual sync)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResult(await handleDatabaseError(error));
  }
}

/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(data: unknown, view: string): string {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return 'No data available';
  }

  if (view === 'overview') {
    const headers = Object.keys(data as Record<string, unknown>);
    const values = Object.values(data as Record<string, unknown>);
    return [headers.join(','), values.join(',')].join('\n');
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return 'No data available';

    const headers = Object.keys(data[0] as Record<string, unknown>);
    const rows = data.map(row =>
      headers
        .map(header => {
          const value = (row as Record<string, unknown>)[header];
          // Escape commas and quotes in CSV
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  return 'Invalid data format';
}
