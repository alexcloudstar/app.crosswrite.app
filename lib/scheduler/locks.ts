/**
 * Advisory lock utilities for concurrency control
 * Uses Postgres advisory locks to prevent double processing
 */

import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

/**
 * Generate a deterministic advisory lock key for a scheduled post
 * Uses the scheduled post ID to ensure uniqueness
 */
export function generateLockKey(scheduledPostId: string): number {
  // Convert UUID to a numeric hash for advisory lock
  // Postgres advisory locks work with bigint, so we hash the UUID
  let hash = 0;
  for (let i = 0; i < scheduledPostId.length; i++) {
    const char = scheduledPostId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Acquire an advisory lock for a scheduled post
 * Returns true if lock was acquired, false if already locked
 */
export async function acquireLock(scheduledPostId: string): Promise<boolean> {
  const lockKey = generateLockKey(scheduledPostId);

  try {
    // Try to acquire the advisory lock
    const result = await db.execute(
      sql`SELECT pg_try_advisory_lock(${lockKey})`
    );

    // pg_try_advisory_lock returns true if lock was acquired, false if already locked
    const rows = result as unknown as Array<{ pg_try_advisory_lock: boolean }>;
    return rows[0]?.pg_try_advisory_lock === true;
  } catch (error) {
    console.error('Failed to acquire advisory lock:', error);
    return false;
  }
}

/**
 * Release an advisory lock for a scheduled post
 * Should be called after processing is complete
 */
export async function releaseLock(scheduledPostId: string): Promise<void> {
  const lockKey = generateLockKey(scheduledPostId);

  try {
    await db.execute(sql`SELECT pg_advisory_unlock(${lockKey})`);
  } catch (error) {
    console.error('Failed to release advisory lock:', error);
    // Don't throw - lock will be automatically released when session ends
  }
}

/**
 * Check if a scheduled post is already being processed
 * Uses advisory lock to determine if another process has claimed it
 */
export async function isLocked(scheduledPostId: string): Promise<boolean> {
  const lockKey = generateLockKey(scheduledPostId);

  try {
    const result = await db.execute(
      sql`SELECT pg_try_advisory_lock(${lockKey})`
    );

    const rows = result as unknown as Array<{ pg_try_advisory_lock: boolean }>;
    const acquired = rows[0]?.pg_try_advisory_lock === true;

    // If we acquired the lock, release it immediately (we just wanted to check)
    if (acquired) {
      await db.execute(sql`SELECT pg_advisory_unlock(${lockKey})`);
    }

    // If we couldn't acquire it, it means it's locked
    return !acquired;
  } catch (error) {
    console.error('Failed to check lock status:', error);
    return false; // Assume not locked on error
  }
}

/**
 * Generate an idempotency key for a scheduled post
 * Used to prevent duplicate processing
 */
export function generateIdempotencyKey(
  scheduledPostId: string,
  draftId: string,
  platforms: string[]
): string {
  const platformsHash = platforms.sort().join(',');
  return `${scheduledPostId}:${draftId}:${platformsHash}`;
}

/**
 * Check if a scheduled post has already been successfully published
 * Uses platform_posts table to determine if all platforms succeeded
 */
export async function isAlreadyPublished(
  scheduledPostId: string,
  draftId: string,
  platforms: string[]
): Promise<boolean> {
  try {
    const { platformPosts } = await import('@/db/schema');
    const { eq, and, inArray } = await import('drizzle-orm');

    const results = await db
      .select()
      .from(platformPosts)
      .where(
        and(
          eq(platformPosts.draftId, draftId),
          inArray(platformPosts.platform, platforms),
          eq(platformPosts.status, 'success')
        )
      );

    // Check if all required platforms have successful posts
    const successfulPlatforms = new Set(results.map(r => r.platform));
    return platforms.every(platform => successfulPlatforms.has(platform));
  } catch (error) {
    console.error('Failed to check if already published:', error);
    return false; // Assume not published on error
  }
}
