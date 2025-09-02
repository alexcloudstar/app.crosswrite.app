'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import logger from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function successResult<T>(data: T): Promise<ActionResult<T>> {
  return { success: true, data };
}

export async function errorResult(message: string): Promise<ActionResult> {
  return { success: false, error: message };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.id) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function revalidateDashboard() {
  revalidatePath('/dashboard');
  revalidatePath('/drafts');
  revalidatePath('/scheduler');
  revalidatePath('/integrations');
}

export async function revalidatePathHelper(path: string) {
  revalidatePath(path);
}

export async function handleDatabaseError(error: unknown): Promise<string> {
  logger.error('Database error:', { error });

  // Capture error in Sentry with user context
  try {
    const session = await getSession();
    if (session?.id) {
      Sentry.setUser({ id: session.id });
    }

    Sentry.captureException(error, {
      tags: {
        type: 'database_error',
        component: 'server_action',
      },
    });
  } catch (sentryError) {
    // Don't fail if Sentry fails
    logger.error('Sentry error:', { sentryError });
  }

  if (error instanceof Error) {
    if (error.message.includes('duplicate key')) {
      return 'A record with this information already exists';
    }
    if (error.message.includes('foreign key')) {
      return 'Referenced record not found';
    }
    if (error.message.includes('not null')) {
      return 'Required field is missing';
    }
  }

  return 'An unexpected error occurred';
}

// Performance monitoring wrapper for server actions
export async function withPerformanceMonitoring<T>(
  actionName: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    // Log slow operations
    if (duration > 500) {
      logger.warn(`Slow operation detected: ${actionName} took ${duration}ms`);

      // Send to Sentry as performance issue
      try {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `Slow operation: ${actionName}`,
          level: 'warning',
          data: {
            actionName,
            duration,
            threshold: 500,
          },
        });
      } catch (sentryError) {
        // Don't fail if Sentry fails
        logger.error('Sentry breadcrumb error:', { sentryError });
      }
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Capture error with performance context
    try {
      Sentry.captureException(error, {
        tags: {
          actionName,
          duration,
          type: 'server_action_error',
        },
      });
    } catch (sentryError) {
      // Don't fail if Sentry fails
      logger.error('Sentry error:', { sentryError });
    }

    throw error;
  }
}
