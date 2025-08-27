import { PLATFORM_CONFIGS, truncateText, sanitizeTags } from './_core';

export interface Draft {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

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

  // Map title
  const title = truncateText(draft.title, config.maxTitleLength);

  // Map body content
  let body = draft.content;

  // Platform-specific content transformations
  switch (platform) {
    case 'devto':
      // Dev.to uses markdown with frontmatter
      body = transformForDevto(draft.content, draft.tags || []);
      break;
    case 'hashnode':
      // Hashnode uses markdown
      body = transformForHashnode(draft.content);
      break;
    case 'beehiiv':
      // Beehiiv uses HTML
      body = transformForBeehiiv(draft.content);
      break;
  }

  // Truncate body if needed
  body = truncateText(body, config.maxBodyLength);

  // Map tags
  const tags =
    draft.tags && config.maxTags > 0
      ? sanitizeTags(draft.tags, config.maxTags)
      : undefined;

  // Map cover image
  const coverUrl = draft.thumbnailUrl || undefined;

  // Map canonical URL
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
  // Dev.to uses frontmatter for metadata
  const frontmatter = [
    '---',
    `title: ${content.split('\n')[0]?.replace(/^#+\s*/, '') || 'Untitled'}`,
    `published: false`,
  ];

  if (tags.length > 0) {
    frontmatter.push(`tags: ${tags.join(', ')}`);
  }

  frontmatter.push('---\n');

  // Remove any existing frontmatter
  content = content.replace(/^---[\s\S]*?---\n/, '');

  return frontmatter.join('\n') + content.trim();
}

function transformForHashnode(content: string): string {
  // Hashnode-specific transformations
  // Remove any existing frontmatter
  content = content.replace(/^---[\s\S]*?---\n/, '');

  // Ensure proper markdown formatting
  content = content.trim();

  return content;
}

function transformForBeehiiv(content: string): string {
  // Convert markdown to HTML for Beehiiv
  // This is a basic conversion - in production you might want to use a proper markdown parser

  let html = content
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs
  html = `<p>${html}</p>`;

  return html;
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

  // Validate title
  if (!draft.title.trim()) {
    errors.push('Title is required');
  } else if (draft.title.length > config.maxTitleLength) {
    errors.push(`Title must be ${config.maxTitleLength} characters or less`);
  }

  // Validate content
  if (!draft.content.trim()) {
    errors.push('Content is required');
  } else if (draft.content.length > config.maxBodyLength) {
    errors.push(`Content must be ${config.maxBodyLength} characters or less`);
  }

  // Validate tags
  if (draft.tags && draft.tags.length > config.maxTags) {
    errors.push(`Maximum ${config.maxTags} tags allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
