import {
  IntegrationClient,
  MappedContent,
  normalizeError,
  validateTitle,
} from './_core';
import logger from '../logger';

export type DevtoIntegration = {
  apiKey: string;
};

function normalizeDevtoMarkdown(markdown: string): string {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const content = markdown.replace(frontMatterRegex, '').trim();

  return content;
}

function sanitizeDevtoTags(tags: string[]): string[] {
  return tags
    .map(tag =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(tag => tag.length > 0 && tag.length <= 20);
}

export class DevtoClient implements IntegrationClient {
  private integration: DevtoIntegration;
  private baseUrl = 'https://dev.to/api';

  constructor(integration: DevtoIntegration) {
    this.integration = integration;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'api-key': this.integration.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.id) {
        throw new Error('Invalid API response from Dev.to');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: normalizeError(error),
      };
    }
  }

  async publish(
    content: MappedContent
  ): Promise<{ platformPostId: string; platformUrl: string }> {
    const titleValidation = validateTitle(content.title, 'devto');
    if (!titleValidation.valid) {
      throw new Error(titleValidation.error);
    }

    logger.info('Publishing to Dev.to:', {
      title: content.title,
      contentLength: content.body?.length || 0,
      tags: content.tags,
    });

    const normalizedMarkdown = normalizeDevtoMarkdown(content.body);

    const response = await fetch(`${this.baseUrl}/articles`, {
      method: 'POST',
      headers: {
        'api-key': this.integration.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: {
          title: content.title,
          body_markdown: normalizedMarkdown,
          tags: sanitizeDevtoTags(content.tags || []),
          canonical_url: content.canonicalUrl,
          main_image: content.coverUrl,
          published: !content.publishAsDraft,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Dev.to API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.id) {
      logger.error('Dev.to API response missing ID:', data);
      throw new Error('Failed to publish to Dev.to');
    }

    logger.info('Successfully published to Dev.to:', {
      articleId: data.id,
      url: data.url,
    });

    return {
      platformPostId: data.id.toString(),
      platformUrl: data.url,
    };
  }

  async syncStatus(): Promise<void> {
    throw new Error('Status sync not implemented for Dev.to');
  }
}

export function createDevtoClient(integration: DevtoIntegration): DevtoClient {
  return new DevtoClient(integration);
}
