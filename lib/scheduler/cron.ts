import { processDueJobs, ProcessingResult } from './engine';
import { successResult, errorResult } from '@/app/actions/_utils';

export async function processScheduledPostsCron(): Promise<{
  success: boolean;
  data?: ProcessingResult;
  error?: string;
}> {
  try {
    console.log('Starting scheduled posts processing...');

    const result = await processDueJobs();

    console.log('Scheduled posts processing completed:', {
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      skipped: result.skipped,
      errors: result.errors.length,
    });

    return successResult(result);
  } catch (error) {
    console.error('Error in scheduled posts cron:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function manualProcessScheduledPosts(): Promise<{
  success: boolean;
  data?: ProcessingResult;
  error?: string;
}> {
  return processScheduledPostsCron();
}

export async function getSchedulerStatus(): Promise<{
  success: boolean;
  data?: {
    status: 'healthy' | 'error';
    lastRun?: Date;
    pendingJobs?: number;
    error?: string;
  };
  error?: string;
}> {
  try {
    const { db } = await import('@/db/client');
    const { scheduledPosts } = await import('@/db/schema');
    const { eq, and, lte } = await import('drizzle-orm');

    const now = new Date();
    const pendingJobs = await db
      .select({ count: scheduledPosts.id })
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.status, 'pending'),
          lte(scheduledPosts.scheduledAt, now)
        )
      );

    return successResult({
      status: 'healthy',
      pendingJobs: pendingJobs.length,
    });
  } catch (error) {
    console.error('Error checking scheduler status:', error);
    return successResult({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
