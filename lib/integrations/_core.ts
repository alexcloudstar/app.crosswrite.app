import { checkRateLimit } from '@/lib/utils/rateLimit';

export type IntegrationClient = {
  testConnection(): Promise<{ success: boolean; error?: string }>;
  publish(
    content: MappedContent
  ): Promise<{ platformPostId: string; platformUrl: string }>;
  syncStatus?(params?: SyncParams): Promise<void>;
};

export type MappedContent = {
  title: string;
  body: string;
  tags?: string[];
  coverUrl?: string;
  canonicalUrl?: string;
  publicationId?: string;
  publishAsDraft?: boolean;
};

export type SyncParams = {
  since?: Date;
  limit?: number;
};

export type PlatformConfig = {
  name: string;
  minTitleLength: number;
  maxTitleLength: number;
  maxBodyLength: number;
  maxTags: number;
  supportsDrafts: boolean;
  supportsPublications: boolean;
  supportsCoverImages: boolean;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
};

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  devto: {
    name: 'Dev.to',
    minTitleLength: 1,
    maxTitleLength: 95,
    maxBodyLength: 64000,
    maxTags: 4,
    supportsDrafts: true,
    supportsPublications: false,
    supportsCoverImages: true,
    rateLimit: { requests: 10, windowMs: 60000 },
  },
  hashnode: {
    name: 'Hashnode',
    minTitleLength: 6,
    maxTitleLength: 100,
    maxBodyLength: 100000,
    maxTags: 10,
    supportsDrafts: true,
    supportsPublications: true,
    supportsCoverImages: true,
    rateLimit: { requests: 10, windowMs: 60000 },
  },
};

export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('api key') ||
      message.includes('token') ||
      message.includes('auth')
    ) {
      return 'Authentication failed. Please check your credentials.';
    }
    if (
      message.includes('rate limit') ||
      message.includes('too many requests')
    ) {
      return 'Rate limit exceeded. Please try again later.';
    }
    if (message.includes('network') || message.includes('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
  return 'An unexpected error occurred. Please try again.';
}

export function checkPlatformRateLimit(
  platform: string,
  userId: string
): boolean {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) return false;

  const identifier = `platform:${platform}:${userId}`;
  const result = checkRateLimit(
    identifier,
    config.rateLimit.requests,
    config.rateLimit.windowMs
  );

  return result.allowed;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function sanitizeTags(tags: string[], maxTags: number): string[] {
  return tags
    .map(tag =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
    )
    .filter(tag => tag.length > 0)
    .slice(0, maxTags);
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          reject(error);
          return;
        }

        const delay = baseDelay * Math.pow(2, retries - 1);
        setTimeout(attempt, delay);
      }
    };

    attempt();
  });
}

export function validateTitle(
  title: string,
  platform: string
): { valid: boolean; error?: string } {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    return { valid: false, error: `Unsupported platform: ${platform}` };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < config.minTitleLength) {
    return {
      valid: false,
      error: `Title must be at least ${config.minTitleLength} characters long for ${config.name}`,
    };
  }

  if (trimmedTitle.length > config.maxTitleLength) {
    return {
      valid: false,
      error: `Title must be no more than ${config.maxTitleLength} characters long for ${config.name}`,
    };
  }

  return { valid: true };
}
