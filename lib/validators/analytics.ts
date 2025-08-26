import { z } from 'zod';

export const analyticsRangeSchema = z
  .object({
    startDate: z.iso.datetime('Invalid start date'),
    endDate: z.iso.datetime('Invalid end date'),
  })
  .refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  });

export const analyticsRangePresetSchema = z.enum([
  '7d',
  '30d',
  '90d',
  '1y',
  'all',
]);
