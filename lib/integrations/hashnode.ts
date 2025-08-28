import {
  IntegrationClient,
  MappedContent,
  normalizeError,
  validateTitle,
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

  async getPublications(): Promise<HashnodePublication[]> {
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
                      _id
                      title
                      domain
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

      return data.data.me.publications.edges.map(
        (edge: { node: HashnodePublication }) => edge.node
      );
    } catch (error) {
      console.error('Error fetching Hashnode publications:', error);
      throw new Error(`Failed to fetch publications: ${normalizeError(error)}`);
    }
  }

  async publish(
    content: MappedContent
  ): Promise<{ platformPostId: string; platformUrl: string }> {
    const publicationId = this.integration.publicationId;
    if (!publicationId) {
      throw new Error('Publication ID is required for publishing');
    }

    const titleValidation = validateTitle(content.title, 'hashnode');
    if (!titleValidation.valid) {
      throw new Error(titleValidation.error);
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.integration.apiKey}`,
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
                id
                slug
                url
              }
            }
          }
        `,
        variables: {
          input: {
            title: content.title,
            contentMarkdown: content.body,
            publicationId: publicationId,
            tags: content.tags?.slice(0, 5) || [],
            isRepublished: false,
            isPartOfPublication: true,
          },
        },
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

    const result = data.data.createStory;

    if (!result.success) {
      throw new Error(result.message || 'Failed to publish to Hashnode');
    }

    const postId = result.story.id;
    const url = result.story.url;

    return {
      platformPostId: postId,
      platformUrl: url,
    };
  }

  async syncStatus(): Promise<void> {
    throw new Error('Status sync not implemented for Hashnode');
  }
}

export function createHashnodeClient(
  integration: HashnodeIntegration
): HashnodeClient {
  return new HashnodeClient(integration);
}
