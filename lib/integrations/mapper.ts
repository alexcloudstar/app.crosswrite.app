import { PLATFORM_CONFIGS, truncateText, sanitizeTags } from './_core';
import { Draft } from '@/lib/types/drafts';

export interface MappedContent {
  title: string;
  body: string;
  tags?: string[];
  coverUrl?: string;
  canonicalUrl?: string;
  publicationId?: string;
  publishAsDraft?: boolean;
}

export interface MappingOptions {
  publishAsDraft?: boolean;
  publicationId?: string;
  canonicalUrl?: string;
  setAsCanonical?: boolean;
}

export function mapContentForPlatform(
  draft: Draft,
  platform: string,
  options: MappingOptions = {}
): MappedContent {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const title = truncateText(draft.title, config.maxTitleLength);

  let body = draft.content;

  switch (platform) {
    case 'devto':
      body = transformForDevto(draft.content, draft.tags || []);
      break;
    case 'hashnode':
      body = transformForHashnode(draft.content);
      break;
  }

  body = truncateText(body, config.maxBodyLength);

  const tags =
    draft.tags && config.maxTags > 0
      ? sanitizeTags(draft.tags, config.maxTags)
      : undefined;

  const coverUrl = draft.thumbnailUrl || undefined;

  const canonicalUrl = options.setAsCanonical
    ? `${process.env.NEXT_PUBLIC_APP_URL}/drafts/${draft.id}`
    : options.canonicalUrl;

  return {
    title,
    body,
    tags,
    coverUrl,
    canonicalUrl,
    publicationId: options.publicationId,
    publishAsDraft: options.publishAsDraft,
  };
}

function transformForDevto(content: string, tags: string[]): string {
  const frontmatter = [
    '---',
    `title: ${content.split('\n')[0]?.replace(/^#+\s*/, '') || 'Untitled'}`,
    `published: false`,
  ];

  if (tags.length > 0) {
    frontmatter.push(`tags: ${tags.join(', ')}`);
  }

  frontmatter.push('---\n');

  content = content.replace(/^---[\s\S]*?---\n/, '');

  return frontmatter.join('\n') + content.trim();
}

function transformForHashnode(content: string): string {
  content = content.replace(/^---[\s\S]*?---\n/, '');

  content = content.trim();

  return content;
}

export function validateContentForPlatform(
  draft: Draft,
  platform: string
): { valid: boolean; errors: string[] } {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    return { valid: false, errors: [`Unsupported platform: ${platform}`] };
  }

  const errors: string[] = [];

  if (!draft.title.trim()) {
    errors.push('Title is required');
  } else if (draft.title.length > config.maxTitleLength) {
    errors.push(`Title must be ${config.maxTitleLength} characters or less`);
  }

  if (!draft.content.trim()) {
    errors.push('Content is required');
  } else if (draft.content.length > config.maxBodyLength) {
    errors.push(`Content must be ${config.maxBodyLength} characters or less`);
  }

  if (draft.tags && draft.tags.length > config.maxTags) {
    errors.push(`Maximum ${config.maxTags} tags allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
