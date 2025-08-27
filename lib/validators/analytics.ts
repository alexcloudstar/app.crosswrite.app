import { z } from 'zod';
import { isValidTimezone } from '@/lib/analytics/time';

export const analyticsRangeSchema = z
  .object({
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
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

/**
 * Enhanced analytics range schema with timezone and granularity support
 */
export const analyticsRangeExtendedSchema = z
  .object({
    from: z.string().datetime('Invalid from date').optional(),
    to: z.string().datetime('Invalid to date').optional(),
    tz: z.string().refine(isValidTimezone, 'Invalid timezone').optional(),
    granularity: z.enum(['day', 'week']).default('day'),
  })
  .refine(
    data => {
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
      }
      return true;
    },
    {
      message: 'From date must be before or equal to to date',
      path: ['from'],
    }
  );

/**
 * Export schema for analytics data export
 */
export const analyticsExportSchema = z.object({
  view: z.enum(['overview', 'reads', 'platforms', 'posts']),
  format: z.enum(['csv', 'json']),
  range: analyticsRangeExtendedSchema.optional(),
});

/**
 * Analytics query schema for all analytics endpoints
 */
export const analyticsQuerySchema = z.object({
  range: analyticsRangeExtendedSchema.optional(),
  limit: z.number().min(1).max(100).default(10),
});
