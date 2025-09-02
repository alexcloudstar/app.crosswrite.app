import { z } from 'zod';
import { UUID, ISODate, validatePayloadSize } from './common';
import { supportedPlatforms } from '@/lib/config/platforms';

export const createScheduledPostSchema = z
  .object({
    draftId: UUID,
    platforms: z
      .array(z.enum(supportedPlatforms))
      .min(1, 'At least one platform required'),
    scheduledAt: ISODate,
    userTz: z.string().max(50, 'Timezone too long').optional(),
  })
  .refine(
    data => {
      const scheduledDate = new Date(data.scheduledAt);
      const now = new Date();

      return scheduledDate > now;
    },
    {
      message: 'Scheduled date must be in the future',
      path: ['scheduledAt'],
    }
  )
  .refine(
    (data) => validatePayloadSize(data, 5000),
    { message: 'Schedule data too large' }
  );

export const updateScheduledPostSchema = z
  .object({
    id: UUID,
    platforms: z.array(z.enum(supportedPlatforms)).optional(),
    scheduledAt: ISODate.optional(),
    status: z.enum(['pending', 'published', 'cancelled', 'failed']).optional(),
    userTz: z.string().max(50, 'Timezone too long').optional(),
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
  )
  .refine(
    (data) => validatePayloadSize(data, 5000),
    { message: 'Update data too large' }
  );

export const scheduledPostIdSchema = z.object({
  id: UUID,
});

export const bulkScheduleSchema = z.object({
  schedules: z
    .array(createScheduledPostSchema)
    .min(1, 'At least one schedule required')
    .max(10, 'Maximum 10 schedules allowed per bulk operation'),
}).refine(
  (data) => validatePayloadSize(data, 50000),
  { message: 'Bulk schedule data too large' }
);

export const processDueJobsSchema = z.object({
  maxJobs: z.number().int().min(1).max(100).optional().default(10),
  force: z.boolean().optional().default(false),
}).refine(
  (data) => validatePayloadSize(data, 1000),
  { message: 'Process data too large' }
);
