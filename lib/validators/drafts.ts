import { z } from 'zod';
import {
  sanitizeContent,
  sanitizeTags,
  sanitizeTitle,
  generateContentPreview,
  UUID,
  validatePayloadSize,
} from './common';

const draftBase = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .transform(sanitizeTitle),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(15000, 'Content too long')
    .transform(sanitizeContent),
  contentPreview: z
    .string()
    .max(500, 'Preview too long')
    .optional()
    .transform(val => (val ? generateContentPreview(val, 500) : val)),
  platforms: z.array(z.string()).default([]),
  thumbnailUrl: z
    .string()
    .url('Invalid thumbnail URL')
    .optional()
    .or(z.literal('')),
  seoTitle: z
    .string()
    .max(60, 'SEO title too long')
    .optional()
    .transform(val => (val ? sanitizeTitle(val) : val)),
  seoDescription: z
    .string()
    .max(160, 'SEO description too long')
    .optional()
    .transform(val => (val ? generateContentPreview(val, 160) : val)),
  tags: z.array(z.string()).default([]).transform(sanitizeTags),
});

export const createDraftSchema = draftBase.refine(
  data => validatePayloadSize(data, 20000),
  { message: 'Draft data too large' }
);

export const updateDraftSchema = draftBase
  .partial()
  .extend({
    id: UUID,
  })
  .refine(data => validatePayloadSize(data, 20000), {
    message: 'Update data too large',
  });

export const listDraftsSchema = z
  .object({
    page: z.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit too high')
      .default(20),
    status: z.enum(['draft', 'scheduled', 'published']).optional(),
    search: z.string().max(100, 'Search term too long').optional(),
  })
  .refine(data => validatePayloadSize(data, 1000), {
    message: 'Search parameters too large',
  });

export const publishDraftSchema = z
  .object({
    draftId: UUID,
    platforms: z.array(z.string()).min(1, 'At least one platform required'),
    options: z
      .object({
        publishAsDraft: z.boolean().optional(),
        setAsCanonical: z.boolean().optional(),
      })
      .optional(),
  })
  .refine(data => validatePayloadSize(data, 5000), {
    message: 'Publish data too large',
  });

export const scheduleDraftSchema = z
  .object({
    draftId: UUID,
    platforms: z.array(z.string()).min(1, 'At least one platform required'),
    scheduledAt: z.string().datetime('Invalid scheduled date'),
    userTz: z.string().optional(),
  })
  .refine(data => validatePayloadSize(data, 5000), {
    message: 'Schedule data too large',
  });

export const draftIdSchema = z.object({
  id: UUID,
});
