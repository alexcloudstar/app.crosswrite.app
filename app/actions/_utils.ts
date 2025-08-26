'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function errorResult(message: string): ActionResult {
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

export function revalidateDashboard() {
  revalidatePath('/dashboard');
}

export function revalidatePathHelper(path: string) {
  revalidatePath(path);
}

export function handleDatabaseError(error: unknown): string {
  console.error('Database error:', error);

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
