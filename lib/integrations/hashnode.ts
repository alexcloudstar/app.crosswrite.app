import {
  IntegrationClient,
  MappedContent,
  normalizeError,
  retryWithBackoff,
} from './_core';

export interface HashnodeIntegration {
  apiKey: string;
  publicationId?: string;
}

export interface HashnodePublication {
  _id: string;
  title: string;
  domain: string;
  description: string;
  isTeam: boolean;
}

export class HashnodeClient implements IntegrationClient {
  private integration: HashnodeIntegration;
  private baseUrl = 'https://api.hashnode.com';

  constructor(integration: HashnodeIntegration) {
    this.integration = integration;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: this.integration.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                id
                username
                publicationDomain
                publications {
                  _id
                  title
                  domain
                  description
                  isTeam
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: normalizeError(error),
      };
    }
  }

  async getPublications(): Promise<{
    success: boolean;
    publications?: HashnodePublication[];
    error?: string;
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: this.integration.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                publications {
                  _id
                  title
                  domain
                  description
                  isTeam
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const publications: HashnodePublication[] = data.data.me.publications;

      return { success: true, publications };
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
      const publicationId =
        content.publicationId || this.integration.publicationId;

      if (!publicationId) {
        throw new Error('Publication ID is required for Hashnode publishing');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: this.integration.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateStory($input: CreateStoryInput!) {
              createStory(input: $input) {
                code
                success
                message
                story {
                  _id
                  slug
                  title
                  brief
                  dateAdded
                  isActive
                  isDelisted
                  isRepublished
                  publication {
                    domain
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              title: content.title,
              contentMarkdown: content.body,
              tags:
                content.tags?.map(tag => ({
                  _id: tag,
                  slug: tag,
                  name: tag,
                })) || [],
              coverImageURL: content.coverUrl,
              isRepublished: false,
              isActive: !content.publishAsDraft,
              publicationId: publicationId,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Hashnode API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      if (!data.data.createStory.success) {
        throw new Error(data.data.createStory.message);
      }

      const story = data.data.createStory.story;
      const domain = story.publication.domain;

      return {
        platformPostId: story._id,
        platformUrl: `https://${domain}/${story.slug}`,
      };
    });
  }

  async syncStatus(): Promise<void> {
    // TODO: Implement status sync for Hashnode posts
    // Hashnode provides limited status information via GraphQL
    throw new Error('Status sync not implemented for Hashnode');
  }

  async syncAnalytics(): Promise<void> {
    // TODO: Implement analytics sync for Hashnode posts
    // Hashnode analytics are limited and would require scraping
    throw new Error('Analytics sync not implemented for Hashnode');
  }
}

export function createHashnodeClient(
  integration: HashnodeIntegration
): HashnodeClient {
  return new HashnodeClient(integration);
}
