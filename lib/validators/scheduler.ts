import { z } from 'zod';
import { supportedPlatforms } from './integrations';

export const createScheduledPostSchema = z
  .object({
    draftId: z.uuid('Invalid draft ID'),
    platforms: z
      .array(z.enum(supportedPlatforms))
      .min(1, 'At least one platform required'),
    scheduledAt: z.iso.datetime('Invalid scheduled date'),
  })
  .refine(data => new Date(data.scheduledAt) > new Date(), {
    message: 'Scheduled date must be in the future',
    path: ['scheduledAt'],
  });

export const updateScheduledPostSchema = z
  .object({
    id: z.uuid('Invalid scheduled post ID'),
    platforms: z.array(z.enum(supportedPlatforms)).optional(),
    scheduledAt: z.iso.datetime('Invalid scheduled date').optional(),
    status: z.enum(['pending', 'published', 'cancelled', 'failed']).optional(),
  })
  .refine(
    data => {
      if (data.scheduledAt) {
        return new Date(data.scheduledAt) > new Date();
      }
      return true;
    },
    {
      message: 'Scheduled date must be in the future',
      path: ['scheduledAt'],
    }
  );

export const scheduledPostIdSchema = z.object({
  id: z.uuid('Invalid scheduled post ID'),
});
