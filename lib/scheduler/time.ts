export const SCHEDULER_CONFIG = {
  GRACE_WINDOW_MS: parseInt(process.env.SCHEDULER_GRACE_WINDOW_MS || '60000'),
  MAX_CONCURRENCY: parseInt(process.env.SCHEDULER_MAX_CONCURRENCY || '3'),
  MAX_RETRIES: parseInt(process.env.SCHEDULER_MAX_RETRIES || '3'),
} as const;

export function isDueForProcessing(scheduledAt: Date): boolean {
  const now = new Date();
  const graceWindow = new Date(
    now.getTime() - SCHEDULER_CONFIG.GRACE_WINDOW_MS
  );
  return scheduledAt <= graceWindow;
}

export function toUTC(date: Date, userTz?: string): Date {
  if (!userTz) {
    return date;
  }

  return date;
}

export function fromUTC(date: Date, userTz?: string): Date {
  if (!userTz) {
    return date;
  }

  return date;
}

export function getNextRetryTime(retryCount: number): Date {
  const backoffMs = Math.min(30000 * Math.pow(2, retryCount), 120000);
  return new Date(Date.now() + backoffMs);
}

export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('timeout')) {
    return true;
  }

  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }

  if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503')
  ) {
    return true;
  }

  return false;
}

export function normalizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unknown error occurred';
  }

  let message = error.message;

  message = message.replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]');

  message = message.replace(/https?:\/\/[^\s]+/g, '[URL]');

  if (message.length > 500) {
    message = message.substring(0, 497) + '...';
  }

  return message;
}
