'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import logger from '@/lib/logger';

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

export async function requireAuth(): Promise<{ id: string; email?: string }> {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return {
    id: session.id,
    email: session.email || undefined,
  };
}

export async function revalidateDashboard() {
  revalidatePath('/dashboard');
}

export async function revalidatePathHelper(path: string) {
  revalidatePath(path);
}

export async function handleDatabaseError(error: unknown): Promise<string> {
  logger.error('Database error:', { error });

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
