import { z } from 'zod';

const draftBase = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  contentPreview: z.string().optional(),
  platforms: z.array(z.string()).default([]),
  thumbnailUrl: z.url().optional().or(z.literal('')),
  seoTitle: z.string().max(60, 'SEO title too long').optional(),
  seoDescription: z.string().max(160, 'SEO description too long').optional(),
  tags: z.array(z.string()).default([]),
});

export const createDraftSchema = draftBase;

export const updateDraftSchema = draftBase.partial().extend({
  id: z.uuid('Invalid draft ID'),
});

export const listDraftsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['draft', 'published', 'scheduled']).optional(),
  search: z.string().optional(),
});

export const publishDraftSchema = z.object({
  id: z.uuid('Invalid draft ID'),
  platforms: z.array(z.string()).min(1, 'At least one platform required'),
});

export const scheduleDraftSchema = z.object({
  id: z.uuid('Invalid draft ID'),
  platforms: z.array(z.string()).min(1, 'At least one platform required'),
  scheduledAt: z.iso.datetime('Invalid scheduled date'),
});

export const draftIdSchema = z.object({
  id: z.uuid('Invalid draft ID'),
});
