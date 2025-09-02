import { supportedPlatforms } from '@/lib/config/platforms';
import { z } from 'zod';
import { UUID, validatePayloadSize } from './common';

export const connectIntegrationSchema = z
  .object({
    platform: z.enum(supportedPlatforms, {
      message: 'Unsupported platform',
    }),
    apiKey: z
      .string()
      .min(1, 'API key is required')
      .max(500, 'API key too long'),
    apiSecret: z.string().max(500, 'API secret too long').optional(),
    accessToken: z.string().max(1000, 'Access token too long').optional(),
    refreshToken: z.string().max(1000, 'Refresh token too long').optional(),
    webhookUrl: z
      .string()
      .url('Invalid webhook URL')
      .max(500, 'Webhook URL too long')
      .optional()
      .or(z.literal('')),
    publicationId: z.string().max(100, 'Publication ID too long').optional(),
  })
  .refine(data => validatePayloadSize(data, 5000), {
    message: 'Integration data too large',
  });

export const updateIntegrationSchema = z
  .object({
    id: UUID,
    apiKey: z
      .string()
      .min(1, 'API key is required')
      .max(500, 'API key too long')
      .optional(),
    apiSecret: z.string().max(500, 'API secret too long').optional(),
    accessToken: z.string().max(1000, 'Access token too long').optional(),
    refreshToken: z.string().max(1000, 'Refresh token too long').optional(),
    webhookUrl: z
      .string()
      .url('Invalid webhook URL')
      .max(500, 'Webhook URL too long')
      .optional()
      .or(z.literal('')),
    publicationId: z.string().max(100, 'Publication ID too long').optional(),
    autoPublish: z.boolean().optional(),
    syncInterval: z.number().int().min(30).max(1440).optional(),
  })
  .refine(data => validatePayloadSize(data, 5000), {
    message: 'Update data too large',
  });

export const integrationIdSchema = z.object({
  id: UUID,
});

export const publishToPlatformsSchema = z
  .object({
    draftId: UUID,
    platforms: z
      .array(z.enum(supportedPlatforms))
      .min(1, 'At least one platform required'),
    options: z
      .object({
        publishAsDraft: z.boolean().optional(),
        setAsCanonical: z.boolean().optional(),
        publicationId: z
          .string()
          .max(100, 'Publication ID too long')
          .optional(),
      })
      .optional(),
  })
  .refine(data => validatePayloadSize(data, 5000), {
    message: 'Publish data too large',
  });

export const syncPlatformSchema = z
  .object({
    platform: z.enum(supportedPlatforms).optional(),
    since: z.string().datetime('Invalid date format').optional(),
    limit: z.number().int().min(1).max(100).optional(),
  })
  .refine(data => validatePayloadSize(data, 2000), {
    message: 'Sync data too large',
  });

export const testPlatformConnectionSchema = z
  .object({
    id: UUID,
  })
  .refine(data => validatePayloadSize(data, 1000), {
    message: 'Test data too large',
  });

export const hashnodePublishOptionsSchema = z.object({
  publicationId: z.string().min(1, 'Publication ID is required for Hashnode'),
  publishAsDraft: z.boolean().optional(),
});

export const devtoPublishOptionsSchema = z.object({
  publishAsDraft: z.boolean().optional(),
  setAsCanonical: z.boolean().optional(),
});
