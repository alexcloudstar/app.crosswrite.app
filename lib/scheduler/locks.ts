import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import logger from '../logger';

export function generateLockKey(scheduledPostId: string): number {
  let hash = 0;
  for (let i = 0; i < scheduledPostId.length; i++) {
    const char = scheduledPostId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function acquireLock(scheduledPostId: string): Promise<boolean> {
  const lockKey = generateLockKey(scheduledPostId);

  try {
    const result = await db.execute(
      sql`SELECT pg_try_advisory_lock(${lockKey})`
    );

    const rows = result as unknown as Array<{ pg_try_advisory_lock: boolean }>;
    return rows[0]?.pg_try_advisory_lock === true;
  } catch (error) {
    logger.error('Failed to acquire advisory lock:', {
      error,
      scheduledPostId,
    });
    return false;
  }
}

export async function releaseLock(scheduledPostId: string): Promise<void> {
  const lockKey = generateLockKey(scheduledPostId);

  try {
    await db.execute(sql`SELECT pg_advisory_unlock(${lockKey})`);
  } catch (error) {
    logger.error('Failed to release advisory lock:', {
      error,
      scheduledPostId,
    });
  }
}

export async function isLocked(scheduledPostId: string): Promise<boolean> {
  const lockKey = generateLockKey(scheduledPostId);

  try {
    const result = await db.execute(
      sql`SELECT pg_try_advisory_lock(${lockKey})`
    );

    const rows = result as unknown as Array<{ pg_try_advisory_lock: boolean }>;
    const acquired = rows[0]?.pg_try_advisory_lock === true;

    if (acquired) {
      await db.execute(sql`SELECT pg_advisory_unlock(${lockKey})`);
    }

    return !acquired;
  } catch (error) {
    logger.error('Failed to check lock status:', { error, scheduledPostId });
    return false;
  }
}

export function generateIdempotencyKey(
  scheduledPostId: string,
  draftId: string,
  platforms: string[]
): string {
  const platformsHash = platforms.sort().join(',');
  return `${scheduledPostId}:${draftId}:${platformsHash}`;
}

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

    const successfulPlatforms = new Set(results.map(r => r.platform));
    return platforms.every(platform => successfulPlatforms.has(platform));
  } catch (error) {
    logger.error('Failed to check if already published:', {
      error,
      scheduledPostId,
      draftId,
      platforms,
    });
    return false;
  }
}
