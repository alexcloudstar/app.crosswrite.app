// Zod validation schemas for AI actions
// These schemas validate inputs for all AI server actions

import { z } from 'zod';

// Base schema for text input validation
const textInputSchema = z.object({
  text: z
    .string()
    .min(1, 'Text cannot be empty')
    .max(10000, 'Text is too long (max 10,000 characters)'),
});

// Improve text action
export const improveTextSchema = textInputSchema.extend({
  goals: z.array(z.string()).optional(),
});

// Adjust tone action
export const adjustToneSchema = textInputSchema.extend({
  tone: z.enum(['professional', 'casual', 'friendly', 'academic']),
});

// Summarize text action
export const summarizeTextSchema = textInputSchema.extend({
  style: z.enum(['bullets', 'paragraph']).optional().default('paragraph'),
  targetWords: z.number().min(10).max(500).optional(),
});

// Generate suggestions action
export const generateSuggestionsSchema = z.object({
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(8000, 'Content is too long (max 8,000 characters)'),
  maxSuggestions: z.number().min(1).max(10).optional().default(4),
});

// Generate thumbnail action
export const generateThumbnailSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(500, 'Prompt is too long (max 500 characters)'),
  aspectRatio: z.enum(['16:9', '1:1', '4:5', '2:1']).optional().default('16:9'),
  size: z.enum(['small', 'medium', 'large']).optional().default('medium'),
});

// Type exports for use in server actions
export type ImproveTextInput = z.infer<typeof improveTextSchema>;
export type AdjustToneInput = z.infer<typeof adjustToneSchema>;
export type SummarizeTextInput = z.infer<typeof summarizeTextSchema>;
export type GenerateSuggestionsInput = z.infer<
  typeof generateSuggestionsSchema
>;
export type GenerateThumbnailInput = z.infer<typeof generateThumbnailSchema>;
