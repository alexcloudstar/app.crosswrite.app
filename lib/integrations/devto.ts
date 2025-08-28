import {
  IntegrationClient,
  MappedContent,
  normalizeError,
  validateTitle,
} from './_core';

export interface DevtoIntegration {
  apiKey: string;
}

function normalizeDevtoMarkdown(
  markdown: string,
  publishAsDraft: boolean
): string {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const match = markdown.match(frontMatterRegex);

  const frontMatter: Record<string, string | boolean> = {};
  let content = markdown;

  if (match) {
    try {
      const yamlContent = match[1];

      const lines = yamlContent.split('\n');
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          if (key && value) {
            frontMatter[key] = value;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse existing front matter:', error);
    }

    content = markdown.replace(frontMatterRegex, '');
  }

  frontMatter.published = !publishAsDraft;

  delete frontMatter.title;
  delete frontMatter.tags;
  delete frontMatter.canonical_url;
  delete frontMatter.cover_image;

  const frontMatterLines = Object.entries(frontMatter).map(
    ([key, value]) => `${key}: ${value}`
  );
  const newFrontMatter =
    frontMatterLines.length > 0
      ? `---\n${frontMatterLines.join('\n')}\n---\n\n`
      : '';

  return newFrontMatter + content.trim();
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

    const normalizedMarkdown = normalizeDevtoMarkdown(
      content.body,
      content.publishAsDraft || false
    );

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
          tags: content.tags || [],
          canonical_url: content.canonicalUrl,
          cover_image: content.coverUrl,
          published: !content.publishAsDraft,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.id) {
      throw new Error('Failed to publish to Dev.to');
    }

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
