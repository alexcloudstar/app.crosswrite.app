import { z } from 'zod';
import { sanitizeContent, validatePayloadSize } from './common';
import { INPUT_LIMITS, FIELD_LIMITS } from '@/lib/constants';

const textInputSchema = z.object({
  text: z
    .string()
    .min(1, 'Text cannot be empty')
    .max(FIELD_LIMITS.content, 'Text is too long (max 15,000 characters)')
    .transform(sanitizeContent),
});

export const improveTextSchema = textInputSchema
  .extend({
    goals: z
      .array(z.string())
      .max(FIELD_LIMITS.maxTags, 'Maximum 5 goals allowed')
      .optional(),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.improveText), {
    message: 'Input data too large',
  });

export const adjustToneSchema = textInputSchema
  .extend({
    targetTone: z.enum([
      'professional',
      'casual',
      'friendly',
      'academic',
      'formal',
      'conversational',
    ]),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.adjustTone), {
    message: 'Input data too large',
  });

export const summarizeTextSchema = textInputSchema
  .extend({
    maxLength: z.number().int().min(50).max(1000).optional().default(200),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.summarizeText), {
    message: 'Input data too large',
  });

export const generateSuggestionsSchema = textInputSchema
  .extend({
    maxSuggestions: z
      .number()
      .int()
      .min(1)
      .max(FIELD_LIMITS.maxSuggestions)
      .optional()
      .default(4),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.generateSuggestions), {
    message: 'Input data too large',
  });

export const extractTagsSchema = z
  .object({
    content: z
      .string()
      .min(1, 'Content cannot be empty')
      .max(FIELD_LIMITS.content, 'Content too long (max 15,000 characters)')
      .transform(sanitizeContent),
    maxTags: z
      .number()
      .int()
      .min(1)
      .max(FIELD_LIMITS.maxTags)
      .optional()
      .default(FIELD_LIMITS.maxTags),
    includeTitle: z.boolean().optional().default(true),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.extractTags), {
    message: 'Input data too large',
  });

export const generateThumbnailSchema = z
  .object({
    articleTitle: z
      .string()
      .min(1, 'Article title cannot be empty')
      .max(FIELD_LIMITS.title, 'Article title too long (max 200 characters)')
      .transform(sanitizeContent),
    articleContent: z
      .string()
      .min(1, 'Article content cannot be empty')
      .max(
        FIELD_LIMITS.content,
        'Article content too long (max 15,000 characters)'
      )
      .transform(sanitizeContent),
  })
  .refine(data => validatePayloadSize(data, INPUT_LIMITS.generateThumbnail), {
    message: 'Input data too large',
  });

export type ImproveTextInput = z.infer<typeof improveTextSchema>;
export type AdjustToneInput = z.infer<typeof adjustToneSchema>;
export type SummarizeTextInput = z.infer<typeof summarizeTextSchema>;
export type GenerateSuggestionsInput = z.infer<
  typeof generateSuggestionsSchema
>;
export type ExtractTagsInput = z.infer<typeof extractTagsSchema>;
export type GenerateThumbnailInput = z.infer<typeof generateThumbnailSchema>;
