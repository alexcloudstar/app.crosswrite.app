import { IntegrationClient } from './_core';
import { createDevtoClient } from './devto';
import { createHashnodeClient } from './hashnode';
import { createBeehiivClient } from './beehiiv';

export interface IntegrationData {
  platform: string;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  publicationId?: string;
}

export function createPlatformClient(
  integration: IntegrationData
): IntegrationClient {
  switch (integration.platform) {
    case 'devto':
      if (!integration.apiKey) {
        throw new Error('Dev.to integration requires API key');
      }
      return createDevtoClient({
        apiKey: integration.apiKey,
      });

    case 'hashnode':
      if (!integration.apiKey) {
        throw new Error('Hashnode integration requires API key');
      }
      return createHashnodeClient({
        apiKey: integration.apiKey,
        publicationId: integration.publicationId,
      });

    case 'beehiiv':
      if (!integration.apiKey) {
        throw new Error('Beehiiv integration requires API key');
      }
      return createBeehiivClient({
        apiKey: integration.apiKey,
        publicationId: integration.publicationId,
      });

    default:
      throw new Error(`Unsupported platform: ${integration.platform}`);
  }
}

export function getSupportedPlatforms(): string[] {
  return ['devto', 'hashnode', 'beehiiv'];
}

export function isPlatformSupported(platform: string): boolean {
  return getSupportedPlatforms().includes(platform);
}
