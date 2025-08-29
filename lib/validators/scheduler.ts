import { z } from 'zod';
import { supportedPlatforms } from '@/lib/config/platforms';

export const createScheduledPostSchema = z
  .object({
    draftId: z.string().uuid('Invalid draft ID'),
    platforms: z
      .array(z.enum(supportedPlatforms))
      .min(1, 'At least one platform required'),
    scheduledAt: z.string().datetime('Invalid scheduled date'),
    userTz: z.string().optional(),
  })
  .refine(
    data => {
      const scheduledDate = new Date(data.scheduledAt);
      const now = new Date();

      // Simple comparison - no timezone conversion for now
      return scheduledDate > now;
    },
    {
      message: 'Scheduled date must be in the future',
      path: ['scheduledAt'],
    }
  );

export const updateScheduledPostSchema = z
  .object({
    id: z.string().uuid('Invalid scheduled post ID'),
    platforms: z.array(z.enum(supportedPlatforms)).optional(),
    scheduledAt: z.string().datetime('Invalid scheduled date').optional(),
    status: z.enum(['pending', 'published', 'cancelled', 'failed']).optional(),
    userTz: z.string().optional(),
  })
  .refine(
    data => {
      if (data.scheduledAt) {
        const scheduledDate = new Date(data.scheduledAt);
        const now = new Date();

        return scheduledDate > now;
      }
      return true;
    },
    {
      message: 'Scheduled date must be in the future',
      path: ['scheduledAt'],
    }
  );

export const scheduledPostIdSchema = z.object({
  id: z.string().uuid('Invalid scheduled post ID'),
});

export const bulkScheduleSchema = z.object({
  schedules: z
    .array(createScheduledPostSchema)
    .min(1, 'At least one schedule required')
    .max(10, 'Maximum 10 schedules allowed per bulk operation'),
});

export const processDueJobsSchema = z.object({
  maxJobs: z.number().min(1).max(50).optional(),
  force: z.boolean().optional(),
});
