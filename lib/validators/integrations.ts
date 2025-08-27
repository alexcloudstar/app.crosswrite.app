import { z } from 'zod';

export const supportedPlatforms = ['devto', 'hashnode'] as const;

export const connectIntegrationSchema = z.object({
  platform: z.enum(supportedPlatforms, {
    message: 'Unsupported platform',
  }),
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  webhookUrl: z.url().optional().or(z.literal('')),
  publicationId: z.string().optional(),
});

export const updateIntegrationSchema = z.object({
  id: z.uuid('Invalid integration ID'),
  autoPublish: z.boolean().optional(),
  syncInterval: z.number().min(30).max(1440).optional(),
  webhookUrl: z.url().optional().or(z.literal('')),
  publicationId: z.string().optional(),
});

export const integrationIdSchema = z.object({
  id: z.uuid('Invalid integration ID'),
});

export const publishToPlatformsSchema = z.object({
  draftId: z.uuid('Invalid draft ID'),
  platforms: z
    .array(z.enum(supportedPlatforms))
    .min(1, 'At least one platform required'),
  options: z
    .object({
      publishAsDraft: z.boolean().optional(),
      setAsCanonical: z.boolean().optional(),
      publicationId: z.string().optional(),
    })
    .optional(),
});

export const syncPlatformSchema = z.object({
  platform: z.enum(supportedPlatforms).optional(),
  since: z.iso.datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const testPlatformConnectionSchema = z.object({
  platform: z.enum(supportedPlatforms),
  integrationId: z.uuid('Invalid integration ID'),
});

export const hashnodePublishOptionsSchema = z.object({
  publicationId: z.string().min(1, 'Publication ID is required for Hashnode'),
  publishAsDraft: z.boolean().optional(),
});

export const devtoPublishOptionsSchema = z.object({
  publishAsDraft: z.boolean().optional(),
  setAsCanonical: z.boolean().optional(),
});
