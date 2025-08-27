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

export function parseDateRange(input: TimeRangeInput): DateRange {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  const from = input.from ? new Date(input.from) : defaultFrom;
  const to = input.to ? new Date(input.to) : now;
  const granularity = input.granularity || 'day';

  if (from > to) {
    throw new Error('Start date must be before or equal to end date');
  }

  const maxRange = 365 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxRange) {
    const clampedFrom = new Date(to.getTime() - maxRange);
    return { from: clampedFrom, to, granularity };
  }

  return { from, to, granularity };
}

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
    return date.toISOString().split('T')[0];
  }
}

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

export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
