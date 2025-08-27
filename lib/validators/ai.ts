import { z } from 'zod';

// Base input validation
const textInput = z
  .string()
  .min(1, 'Text is required')
  .max(10000, 'Text too long');

// Suggestions schema
export const suggestionsSchema = z.object({
  draftId: z.uuid('Invalid draft ID').optional(),
  text: textInput.optional(),
  maxIdeas: z.number().min(1).max(10).default(5),
});

// Improve content schema
export const improveSchema = z.object({
  text: textInput,
  goals: z.array(z.string()).optional(),
});

// Tone adjustment schema
export const toneSchema = z.object({
  text: textInput,
  tone: z.enum([
    'friendly',
    'professional',
    'casual',
    'confident',
    'empathetic',
  ]),
});

// Expand content schema
export const expandSchema = z.object({
  text: textInput,
  outlineHints: z.array(z.string()).optional(),
  targetWords: z.number().min(100).max(5000).optional(),
});

// Summarize content schema
export const summarizeSchema = z.object({
  text: textInput,
  style: z.enum(['bullets', 'paragraph']).default('paragraph'),
  targetWords: z.number().min(50).max(500).optional(),
});

// Translate content schema
export const translateSchema = z.object({
  text: textInput,
  to: z
    .string()
    .min(2, 'Target language is required')
    .max(50, 'Language code too long'),
});

// SEO generation schema
export const seoSchema = z.object({
  title: z.string().max(200, 'Title too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  text: textInput.optional(),
  maxTitle: z.number().min(30).max(70).default(60),
  maxDescription: z.number().min(120).max(160).default(150),
});

// Thumbnail generation schema
export const thumbnailSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  tags: z.array(z.string()).optional(),
  style: z.enum(['clean', 'vibrant', 'minimal']).default('clean'),
  aspect: z.enum(['16:9', '1:1', '4:5']).default('16:9'),
});

// Content analysis schema
export const analyzeSchema = z.object({
  text: textInput,
});

// Draft ID schema for actions that reference drafts
export const draftIdSchema = z.object({
  draftId: z.uuid('Invalid draft ID'),
});
