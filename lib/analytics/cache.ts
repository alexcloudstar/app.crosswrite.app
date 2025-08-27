/**
 * Simple in-memory analytics caching layer
 * Reuses existing pattern from rateLimit.ts
 * In production, consider using Redis for distributed caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const analyticsCache = new Map<string, CacheEntry<any>>();

/**
 * Generate cache key for analytics queries
 */
export function generateCacheKey(
  userId: string,
  view: string,
  from: Date,
  to: Date,
  granularity?: string
): string {
  const key = `${userId}:${view}:${from.toISOString()}:${to.toISOString()}:${
    granularity || 'day'
  }`;
  return key;
}

/**
 * Get cached data if valid
 */
export function getCachedData<T>(key: string): T | null {
  const entry = analyticsCache.get(key);

  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now > entry.timestamp + entry.ttl) {
    // Expired, remove from cache
    analyticsCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache data with TTL
 */
export function setCachedData<T>(
  key: string,
  data: T,
  ttlMs: number = 120000 // 2 minutes default
): void {
  analyticsCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

/**
 * Invalidate cache entries by prefix (for user-specific invalidation)
 */
export function invalidateCacheByPrefix(prefix: string): void {
  const keysToDelete: string[] = [];

  for (const key of analyticsCache.keys()) {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => analyticsCache.delete(key));
}

/**
 * Clear all cache (useful for testing or memory management)
 */
export function clearCache(): void {
  analyticsCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: analyticsCache.size,
    keys: Array.from(analyticsCache.keys()),
  };
}
