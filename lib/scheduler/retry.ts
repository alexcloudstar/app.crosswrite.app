import {
  SCHEDULER_CONFIG,
  isRetryableError,
  getNextRetryTime,
  normalizeErrorMessage,
} from './time';
import logger from '../logger';

export type RetryResult = {
  shouldRetry: boolean;
  nextAttemptAt?: Date;
  errorMessage: string;
};

export function shouldRetry(
  error: unknown,
  currentRetryCount: number
): RetryResult {
  if (currentRetryCount >= SCHEDULER_CONFIG.MAX_RETRIES) {
    return {
      shouldRetry: false,
      errorMessage: normalizeErrorMessage(error),
    };
  }

  if (!isRetryableError(error)) {
    return {
      shouldRetry: false,
      errorMessage: normalizeErrorMessage(error),
    };
  }

  const nextAttemptAt = getNextRetryTime(currentRetryCount);

  return {
    shouldRetry: true,
    nextAttemptAt,
    errorMessage: normalizeErrorMessage(error),
  };
}

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

    if (retryCount >= SCHEDULER_CONFIG.MAX_RETRIES) {
      updateData.status = 'failed';
    }

    await db
      .update(scheduledPosts)
      .set(updateData)
      .where(eq(scheduledPosts.id, scheduledPostId));
  } catch (error) {
    logger.error('Failed to update retry info:', {
      error,
      scheduledPostId,
      retryCount,
    });
  }
}

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
    logger.error('Failed to reset retry info:', { error, scheduledPostId });
  }
}

export function getRetryDelayMs(retryCount: number): number {
  const baseDelay = 30000;

  const exponentialDelay = baseDelay * Math.pow(2, retryCount);

  const jitter = exponentialDelay * 0.1 * (Math.random() - 0.5);

  return Math.min(exponentialDelay + jitter, 120000);
}

export function isReadyForRetry(nextAttemptAt: Date): boolean {
  return new Date() >= nextAttemptAt;
}
