import { z } from 'zod';

export const supportedPlatforms = [
  'medium',
  'devto',
  'hashnode',
  'beehiiv',
  'linkedin',
  'twitter',
] as const;

export const connectIntegrationSchema = z.object({
  platform: z.enum(supportedPlatforms, {
    message: 'Unsupported platform',
  }),
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  webhookUrl: z.url().optional().or(z.literal('')),
});

export const updateIntegrationSchema = z.object({
  id: z.string().uuid('Invalid integration ID'),
  autoPublish: z.boolean().optional(),
  syncInterval: z.number().min(30).max(1440).optional(),
  webhookUrl: z.url().optional().or(z.literal('')),
});

export const integrationIdSchema = z.object({
  id: z.uuid('Invalid integration ID'),
});
