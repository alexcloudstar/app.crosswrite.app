import {
  IntegrationClient,
  MappedContent,
  normalizeError,
  retryWithBackoff,
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
      const titleValidation = validateTitle(content.title, 'devto');
      if (!titleValidation.valid) {
        throw new Error(titleValidation.error);
      }

      if (!content.title?.trim()) {
        throw new Error('Title is required for Dev.to publishing');
      }

      if (!content.body?.trim()) {
        throw new Error('Body content is required for Dev.to publishing');
      }

      const normalizedMarkdown = normalizeDevtoMarkdown(
        content.body,
        content.publishAsDraft || false
      );

      const tags = (content.tags || []).slice(0, 4);

      const shouldPublish = !content.publishAsDraft;

      console.log('Dev.to publishing:', {
        title:
          content.title.substring(0, 50) +
          (content.title.length > 50 ? '...' : ''),
        hasFrontMatter: content.body.includes('---'),
        publishIntent: shouldPublish ? 'publish' : 'draft',
        tagCount: tags.length,
        hasCoverImage: !!content.coverUrl,
        hasCanonicalUrl: !!content.canonicalUrl,
      });

      const requestBody = {
        article: {
          title: content.title.trim(),
          body_markdown: normalizedMarkdown,
          tags,
          published: shouldPublish,
          cover_image: content.coverUrl,
          canonical_url: content.canonicalUrl,
        },
      };

      const response = await fetch(`${this.baseUrl}/articles`, {
        method: 'POST',
        headers: {
          'api-key': this.integration.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dev.to API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(`Dev.to API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      console.log('Dev.to API Success Response:', {
        id: data.id,
        url: data.url,
        published: data.published,
        published_at: data.published_at,
      });

      if (shouldPublish && (!data.published || !data.published_at)) {
        console.log(
          'Dev.to safety net: Article was created as draft, attempting to publish...'
        );

        try {
          const updateResponse = await fetch(
            `${this.baseUrl}/articles/${data.id}`,
            {
              method: 'PUT',
              headers: {
                'api-key': this.integration.apiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                article: {
                  published: true,
                  body_markdown: normalizedMarkdown,
                },
              }),
            }
          );

          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            console.log('Dev.to safety net: Successfully published article:', {
              id: updateData.id,
              published: updateData.published,
              published_at: updateData.published_at,
            });
          } else {
            console.warn(
              'Dev.to safety net: Failed to publish article:',
              updateResponse.status
            );
          }
        } catch (error) {
          console.warn(
            'Dev.to safety net: Error during follow-up publish:',
            error
          );
        }
      }

      return {
        platformPostId: data.id.toString(),
        platformUrl: data.url,
      };
    });
  }

  async syncStatus(): Promise<void> {
    throw new Error('Status sync not implemented for Dev.to');
  }

  async syncAnalytics(): Promise<void> {
    throw new Error('Analytics sync not implemented for Dev.to');
  }
}

export function createDevtoClient(integration: DevtoIntegration): DevtoClient {
  return new DevtoClient(integration);
}
