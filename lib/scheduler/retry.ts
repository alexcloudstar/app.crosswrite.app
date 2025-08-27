/**
 * Retry policy implementation for the scheduler
 * Handles retry logic with bounded backoff
 */

import {
  SCHEDULER_CONFIG,
  isRetryableError,
  getNextRetryTime,
  normalizeErrorMessage,
} from './time';

export interface RetryResult {
  shouldRetry: boolean;
  nextAttemptAt?: Date;
  errorMessage: string;
}

/**
 * Determine if a failed job should be retried
 * Implements bounded retry policy with exponential backoff
 */
export function shouldRetry(
  error: unknown,
  currentRetryCount: number
): RetryResult {
  // Check if we've exceeded max retries
  if (currentRetryCount >= SCHEDULER_CONFIG.MAX_RETRIES) {
    return {
      shouldRetry: false,
      errorMessage: normalizeErrorMessage(error),
    };
  }

  // Check if the error is retryable
  if (!isRetryableError(error)) {
    return {
      shouldRetry: false,
      errorMessage: normalizeErrorMessage(error),
    };
  }

  // Calculate next retry time
  const nextAttemptAt = getNextRetryTime(currentRetryCount);

  return {
    shouldRetry: true,
    nextAttemptAt,
    errorMessage: normalizeErrorMessage(error),
  };
}

/**
 * Update scheduled post with retry information
 * Sets retry count, next attempt time, and error message
 */
export async function updateWithRetryInfo(
  scheduledPostId: string,
  retryCount: number,
  nextAttemptAt?: Date,
  errorMessage?: string
): Promise<void> {
  try {
    const { scheduledPosts } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    const { db } = await import('@/db/client');

    const updateData: Record<string, unknown> = {
      retryCount,
      updatedAt: new Date(),
    };

    if (nextAttemptAt) {
      updateData.scheduledAt = nextAttemptAt;
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    // If we've exceeded max retries, mark as failed
    if (retryCount >= SCHEDULER_CONFIG.MAX_RETRIES) {
      updateData.status = 'failed';
    }

    await db
      .update(scheduledPosts)
      .set(updateData)
      .where(eq(scheduledPosts.id, scheduledPostId));
  } catch (error) {
    console.error('Failed to update retry info:', error);
  }
}

/**
 * Reset retry information when job succeeds
 * Clears retry count and error message
 */
export async function resetRetryInfo(scheduledPostId: string): Promise<void> {
  try {
    const { scheduledPosts } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    const { db } = await import('@/db/client');

    await db
      .update(scheduledPosts)
      .set({
        retryCount: 0,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(scheduledPosts.id, scheduledPostId));
  } catch (error) {
    console.error('Failed to reset retry info:', error);
  }
}

/**
 * Get retry delay in milliseconds for a given retry count
 * Uses exponential backoff with jitter
 */
export function getRetryDelayMs(retryCount: number): number {
  // Base delay: 30 seconds
  const baseDelay = 30000;

  // Exponential backoff: 2^retryCount
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);

  // Add jitter (±10%) to prevent thundering herd
  const jitter = exponentialDelay * 0.1 * (Math.random() - 0.5);

  // Cap at 2 minutes
  return Math.min(exponentialDelay + jitter, 120000);
}

/**
 * Check if a scheduled post is ready for retry
 * Compares current time with next attempt time
 */
export function isReadyForRetry(nextAttemptAt: Date): boolean {
  return new Date() >= nextAttemptAt;
}
