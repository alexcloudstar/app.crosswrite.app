import {
  IntegrationClient,
  MappedContent,
  normalizeError,
  retryWithBackoff,
} from './_core';

export interface BeehiivIntegration {
  apiKey: string;
  publicationId?: string;
}

export interface BeehiivPublication {
  id: string;
  name: string;
  description: string;
  domain: string;
  logo_url: string;
  subscriber_count: number;
}

interface BeehiivApiPublication {
  id: string;
  name: string;
  description: string;
  domain: string;
  logo_url: string;
  subscriber_count: number;
}

export class BeehiivClient implements IntegrationClient {
  private integration: BeehiivIntegration;
  private baseUrl = 'https://api.beehiiv.com/v2';

  constructor(integration: BeehiivIntegration) {
    this.integration = integration;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/publications`, {
        headers: {
          Authorization: `Bearer ${this.integration.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error:
              'Invalid API key. Please check your Beehiiv API credentials.',
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the first publication ID if not already set
      if (
        !this.integration.publicationId &&
        data.data &&
        data.data.length > 0
      ) {
        this.integration.publicationId = data.data[0].id;
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
    publications?: BeehiivPublication[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/publications`, {
        headers: {
          Authorization: `Bearer ${this.integration.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const publications: BeehiivPublication[] = data.data.map(
        (pub: BeehiivApiPublication) => ({
          id: pub.id,
          name: pub.name,
          description: pub.description,
          domain: pub.domain,
          logo_url: pub.logo_url,
          subscriber_count: pub.subscriber_count,
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
        throw new Error('Publication ID is required for Beehiiv publishing');
      }

      const response = await fetch(
        `${this.baseUrl}/publications/${publicationId}/posts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.integration.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: content.title,
            subtitle: content.title, // Beehiiv requires a subtitle
            body_html: content.body,
            status: content.publishAsDraft ? 'draft' : 'published',
            seo_title: content.title,
            seo_description: content.title,
            featured_image_url: content.coverUrl,
            canonical_url: content.canonicalUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Beehiiv API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        platformPostId: data.data.id,
        platformUrl:
          data.data.url || `https://app.beehiiv.com/posts/${data.data.id}`,
      };
    });
  }

  async syncStatus(): Promise<void> {
    // TODO: Implement status sync for Beehiiv posts
    // Beehiiv provides limited status information via API
    throw new Error('Status sync not implemented for Beehiiv');
  }

  async syncAnalytics(): Promise<void> {
    // TODO: Implement analytics sync for Beehiiv posts
    // Beehiiv analytics are available via API but require additional endpoints
    throw new Error('Analytics sync not implemented for Beehiiv');
  }
}

export function createBeehiivClient(
  integration: BeehiivIntegration
): BeehiivClient {
  return new BeehiivClient(integration);
}
