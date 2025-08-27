/**
 * Analytics time utilities for date range parsing, timezone handling, and time bucketing
 * Handles UTC storage with optional timezone formatting for display
 */

export interface DateRange {
  from: Date;
  to: Date;
  granularity: 'day' | 'week';
}

export interface TimeRangeInput {
  from?: string;
  to?: string;
  tz?: string;
  granularity?: 'day' | 'week';
}

/**
 * Parse date range input with defaults and validation
 */
export function parseDateRange(input: TimeRangeInput): DateRange {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  const from = input.from ? new Date(input.from) : defaultFrom;
  const to = input.to ? new Date(input.to) : now;
  const granularity = input.granularity || 'day';

  // Validate and clamp range
  if (from > to) {
    throw new Error('Start date must be before or equal to end date');
  }

  // Clamp to maximum 365 days
  const maxRange = 365 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxRange) {
    const clampedFrom = new Date(to.getTime() - maxRange);
    return { from: clampedFrom, to, granularity };
  }

  return { from, to, granularity };
}

/**
 * Get SQL date truncation for time-series grouping
 */
export function getDateTruncation(granularity: 'day' | 'week'): string {
  switch (granularity) {
    case 'day':
      return 'DATE(recorded_at)';
    case 'week':
      return "DATE_TRUNC('week', recorded_at)";
    default:
      return 'DATE(recorded_at)';
  }
}

/**
 * Format date for display with optional timezone
 */
export function formatDateForDisplay(date: Date, tz?: string): string {
  if (!tz || tz === 'UTC') {
    return date.toISOString().split('T')[0];
  }

  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    // Fallback to UTC if timezone is invalid
    return date.toISOString().split('T')[0];
  }
}

/**
 * Get default date ranges for common periods
 */
export function getDefaultRanges(): Record<string, DateRange> {
  const now = new Date();

  return {
    '7d': {
      from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: now,
      granularity: 'day',
    },
    '30d': {
      from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: now,
      granularity: 'day',
    },
    '90d': {
      from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      to: now,
      granularity: 'day',
    },
    '1y': {
      from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      to: now,
      granularity: 'week',
    },
  };
}

/**
 * Validate timezone string (IANA format)
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
