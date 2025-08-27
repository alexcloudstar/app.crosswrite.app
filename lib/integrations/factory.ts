import { IntegrationClient } from './_core';
import { createDevtoClient } from './devto';
import { createHashnodeClient } from './hashnode';
import { supportedPlatforms, Platform } from '@/lib/config/platforms';

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

    default:
      throw new Error(`Unsupported platform: ${integration.platform}`);
  }
}

export function isPlatformSupported(platform: string): boolean {
  return supportedPlatforms.includes(platform as Platform);
}
