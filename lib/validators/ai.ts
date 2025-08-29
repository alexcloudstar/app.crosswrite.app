import { z } from 'zod';

const textInputSchema = z.object({
  text: z
    .string()
    .min(1, 'Text cannot be empty')
    .max(10000, 'Text is too long (max 10,000 characters)'),
});

export const improveTextSchema = textInputSchema.extend({
  goals: z.array(z.string()).optional(),
});

export const adjustToneSchema = textInputSchema.extend({
  tone: z.enum(['professional', 'casual', 'friendly', 'academic']),
});

export const summarizeTextSchema = textInputSchema.extend({
  style: z.enum(['bullets', 'paragraph']).optional().default('paragraph'),
  targetWords: z.number().min(10).max(500).optional(),
});

export const generateSuggestionsSchema = z.object({
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(8000, 'Content is too long (max 8,000 characters)'),
  maxSuggestions: z.number().min(1).max(10).optional().default(4),
});

export const extractTagsSchema = z.object({
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(8000, 'Content is too long (max 8,000 characters)'),
  maxTags: z.number().min(1).max(15).optional().default(8),
  includeTitle: z.boolean().optional().default(true),
});

export const generateThumbnailSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(500, 'Prompt is too long (max 500 characters)'),
  aspectRatio: z.enum(['16:9', '1:1', '4:5', '2:1']).optional().default('16:9'),
  size: z.enum(['small', 'medium', 'large']).optional().default('medium'),
});

export type ImproveTextInput = z.infer<typeof improveTextSchema>;
export type AdjustToneInput = z.infer<typeof adjustToneSchema>;
export type SummarizeTextInput = z.infer<typeof summarizeTextSchema>;
export type GenerateSuggestionsInput = z.infer<
  typeof generateSuggestionsSchema
>;
export type ExtractTagsInput = z.infer<typeof extractTagsSchema>;
export type GenerateThumbnailInput = z.infer<typeof generateThumbnailSchema>;
