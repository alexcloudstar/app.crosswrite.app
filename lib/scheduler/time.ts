/**
 * Timezone and window helpers for the scheduler
 * Handles UTC storage, grace windows, and timezone conversions
 */

export const SCHEDULER_CONFIG = {
  GRACE_WINDOW_MS: parseInt(process.env.SCHEDULER_GRACE_WINDOW_MS || '60000'),
  MAX_CONCURRENCY: parseInt(process.env.SCHEDULER_MAX_CONCURRENCY || '3'),
  MAX_RETRIES: parseInt(process.env.SCHEDULER_MAX_RETRIES || '3'),
} as const;

/**
 * Check if a scheduled time is due for processing
 * Includes grace window to account for clock skew
 */
export function isDueForProcessing(scheduledAt: Date): boolean {
  const now = new Date();
  const graceWindow = new Date(
    now.getTime() - SCHEDULER_CONFIG.GRACE_WINDOW_MS
  );
  return scheduledAt <= graceWindow;
}

/**
 * Convert user timezone date to UTC for storage
 * Always store scheduled_at in UTC
 */
export function toUTC(date: Date, userTz?: string): Date {
  if (!userTz) {
    // If no timezone provided, assume the date is already in UTC
    return date;
  }

  // For now, return as-is since we're storing in UTC
  // In a full implementation, you'd use a library like date-fns-tz
  // to properly convert from user timezone to UTC
  return date;
}

/**
 * Convert UTC date to user timezone for display
 * This is primarily for UI purposes
 */
export function fromUTC(date: Date, userTz?: string): Date {
  if (!userTz) {
    return date;
  }

  // For now, return as-is since we're not doing timezone conversion
  // In a full implementation, you'd convert from UTC to user timezone
  return date;
}

/**
 * Get the next retry time based on retry count
 * Uses linear backoff: 30s, 60s, 120s
 */
export function getNextRetryTime(retryCount: number): Date {
  const backoffMs = Math.min(30000 * Math.pow(2, retryCount), 120000); // Cap at 2 minutes
  return new Date(Date.now() + backoffMs);
}

/**
 * Check if a failure is retryable
 * Only retry on transient failures
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('timeout')) {
    return true;
  }

  // Rate limiting
  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }

  // Server errors (5xx)
  if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503')
  ) {
    return true;
  }

  return false;
}

/**
 * Normalize error message for storage
 * Remove sensitive information and standardize format
 */
export function normalizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unknown error occurred';
  }

  let message = error.message;

  // Remove potential API keys/tokens
  message = message.replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]');

  // Remove URLs that might contain sensitive data
  message = message.replace(/https?:\/\/[^\s]+/g, '[URL]');

  // Truncate if too long
  if (message.length > 500) {
    message = message.substring(0, 497) + '...';
  }

  return message;
}
