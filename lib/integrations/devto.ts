import {
  IntegrationClient,
  MappedContent,
  normalizeError,
  retryWithBackoff,
} from './_core';

export interface DevtoIntegration {
  apiKey: string;
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    return retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/articles`, {
        method: 'POST',
        headers: {
          'api-key': this.integration.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article: {
            title: content.title,
            body_markdown: content.body,
            tags: content.tags,
            published: !content.publishAsDraft,
            main_image: content.coverUrl,
            canonical_url: content.canonicalUrl,
            published_at: content.publishAsDraft
              ? null
              : new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dev.to API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        platformPostId: data.id.toString(),
        platformUrl: data.url,
      };
    });
  }

  async syncStatus(): Promise<void> {
    // TODO: Implement status sync for Dev.to posts
    // Dev.to doesn't provide a direct API for this
    throw new Error('Status sync not implemented for Dev.to');
  }

  async syncAnalytics(): Promise<void> {
    // TODO: Implement analytics sync for Dev.to posts
    // Dev.to analytics are limited and would require scraping
    throw new Error('Analytics sync not implemented for Dev.to');
  }
}

export function createDevtoClient(integration: DevtoIntegration): DevtoClient {
  return new DevtoClient(integration);
}
