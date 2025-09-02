import { z } from 'zod';
import { StringMax, validatePayloadSize, sanitizeContent } from './common';

const textInputSchema = z.object({
  text: z
    .string()
    .min(1, 'Text cannot be empty')
    .max(10000, 'Text is too long (max 10,000 characters)')
    .transform(sanitizeContent),
});

export const improveTextSchema = textInputSchema.extend({
  goals: z.array(z.string()).max(5, 'Maximum 5 goals allowed').optional(),
}).refine(
  (data) => validatePayloadSize(data, 15000),
  { message: 'Input data too large' }
);

export const adjustToneSchema = textInputSchema.extend({
  targetTone: z.enum(['professional', 'casual', 'friendly', 'academic', 'formal', 'conversational']),
}).refine(
  (data) => validatePayloadSize(data, 12000),
  { message: 'Input data too large' }
);

export const summarizeTextSchema = textInputSchema.extend({
  maxLength: z.number().int().min(50).max(1000).optional().default(200),
}).refine(
  (data) => validatePayloadSize(data, 12000),
  { message: 'Input data too large' }
);

export const generateSuggestionsSchema = textInputSchema.extend({
  maxSuggestions: z.number().int().min(1).max(10).optional().default(4),
}).refine(
  (data) => validatePayloadSize(data, 12000),
  { message: 'Input data too large' }
);

export const extractTagsSchema = z.object({
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(15000, 'Content is too long (max 15,000 characters)')
    .transform(sanitizeContent),
  maxTags: z.number().int().min(1).max(5).optional().default(5),
  includeTitle: z.boolean().optional().default(true),
}).refine(
  (data) => validatePayloadSize(data, 20000),
  { message: 'Input data too large' }
);

export const generateThumbnailSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(500, 'Prompt is too long (max 500 characters)')
    .transform(sanitizeContent),
  style: z.enum(['realistic', 'artistic', 'minimal', 'vintage']).optional().default('realistic'),
}).refine(
  (data) => validatePayloadSize(data, 1000),
  { message: 'Input data too large' }
);

export type ImproveTextInput = z.infer<typeof improveTextSchema>;
export type AdjustToneInput = z.infer<typeof adjustToneSchema>;
export type SummarizeTextInput = z.infer<typeof summarizeTextSchema>;
export type GenerateSuggestionsInput = z.infer<
  typeof generateSuggestionsSchema
>;
export type ExtractTagsInput = z.infer<typeof extractTagsSchema>;
export type GenerateThumbnailInput = z.infer<typeof generateThumbnailSchema>;
