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
  private baseUrl = 'https://gql.hashnode.com';

  constructor(integration: HashnodeIntegration) {
    this.integration = integration;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.integration.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                id
                username
                publications(first: 10) {
                  edges {
                    node {
                      id
                      title
                      about {
                        text
                      }
                      isTeam
                    }
                  }
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
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
          Authorization: `Bearer ${this.integration.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                publications(first: 10) {
                  edges {
                    node {
                      id
                      title
                      about {
                        text
                      }
                      isTeam
                    }
                  }
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const publications: HashnodePublication[] =
        data.data.me.publications.edges.map(
          (edge: {
            node: {
              id: string;
              title: string;
              about?: { text: string };
              isTeam: boolean;
            };
          }) => ({
            _id: edge.node.id,
            title: edge.node.title,
            domain: `${edge.node.id}.hashnode.dev`,
            description: edge.node.about?.text || '',
            isTeam: edge.node.isTeam,
          })
        );

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
          Authorization: `Bearer ${this.integration.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation PublishPost($input: PublishPostInput!) {
              publishPost(input: $input) {
                post {
                  id
                  title
                  url
                  slug
                  publication {
                    id
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              title: content.title,
              contentMarkdown: content.body,
              tags: content.tags || [],
              ...(content.coverUrl && {
                coverImageOptions: { coverImageURL: content.coverUrl },
              }),
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

      if (!data.data.publishPost.post) {
        throw new Error('Failed to publish post to Hashnode');
      }

      const post = data.data.publishPost.post;

      return {
        platformPostId: post.id,
        platformUrl:
          post.url ||
          `https://${post.publication.id}.hashnode.dev/${post.slug}`,
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
