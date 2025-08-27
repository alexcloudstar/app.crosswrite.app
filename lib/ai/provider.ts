// AI Provider for OpenAI integration
// Handles model selection, API key resolution, and rate limiting
// TODO: Move rate limiting to Redis in production

import OpenAI from 'openai';
import { getApiKeyForGeneration } from '@/lib/config/serverConfig';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { SYSTEM_PROMPTS } from './prompt-templates';

export type AiPurpose =
  | 'suggestions'
  | 'improve'
  | 'tone'
  | 'expand'
  | 'summarize'
  | 'translate'
  | 'seo'
  | 'thumbnail'
  | 'analyze';

export type ModelConfig = {
  temperature?: number;
  maxTokens?: number;
  systemPromptId?: string;
};

// Allowed models for security
const ALLOWED_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo',
  'dall-e-3',
  'dall-e-2',
] as const;

type AllowedModel = (typeof ALLOWED_MODELS)[number];

// Default model configuration
const DEFAULT_MODEL: AllowedModel = 'gpt-4o-mini';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

// Input limits for cost and performance control
const MAX_INPUT_CHARS = 10000;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = getApiKeyForGeneration();
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: false, // Server-side only
    });
  }
  return openaiClient;
}

function validateModel(model?: string): AllowedModel {
  if (!model) return DEFAULT_MODEL;
  if (ALLOWED_MODELS.includes(model as AllowedModel)) {
    return model as AllowedModel;
  }
  console.warn(`Invalid model "${model}", using default: ${DEFAULT_MODEL}`);
  return DEFAULT_MODEL;
}

function truncateInput(
  text: string,
  maxChars: number = MAX_INPUT_CHARS
): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '...';
}

function checkUserRateLimit(userId: string, purpose: AiPurpose): boolean {
  const identifier = `ai:${userId}:${purpose}`;
  const rateLimit = checkRateLimit(identifier, 20, 60000); // 20 requests per minute
  return rateLimit.allowed;
}

export async function callTextModel(
  purpose: AiPurpose,
  input: string,
  modelConfig: ModelConfig = {},
  userId: string
): Promise<string> {
  // Rate limiting
  if (!checkUserRateLimit(userId, purpose)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Input validation and truncation
  if (!input.trim()) {
    throw new Error('Input text is required');
  }

  const truncatedInput = truncateInput(input);
  const model = validateModel(modelConfig.systemPromptId);
  const temperature = modelConfig.temperature ?? DEFAULT_TEMPERATURE;
  const maxTokens = modelConfig.maxTokens ?? DEFAULT_MAX_TOKENS;

  const client = getOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(purpose),
        },
        {
          role: 'user',
          content: truncatedInput,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI model');
    }

    return response;
  } catch (error) {
    console.error(`AI text generation error for purpose "${purpose}":`, error);
    throw new Error('Failed to generate AI response');
  }
}

export async function callImageModel(
  purpose: 'thumbnail',
  prompt: string,
  userId: string
): Promise<string> {
  // Rate limiting
  if (!checkUserRateLimit(userId, purpose)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Input validation
  if (!prompt.trim()) {
    throw new Error('Image prompt is required');
  }

  const truncatedPrompt = truncateInput(prompt, 1000); // Shorter limit for image prompts
  const model = 'dall-e-3'; // Use DALL-E 3 for thumbnails

  const client = getOpenAIClient();

  try {
    const response = await client.images.generate({
      model,
      prompt: truncatedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return imageUrl;
  } catch (error) {
    console.error(`AI image generation error for purpose "${purpose}":`, error);
    throw new Error('Failed to generate image');
  }
}

function getSystemPrompt(purpose: AiPurpose): string {
  if (purpose === 'thumbnail') {
    return 'You are an image generation specialist. Create high-quality images based on the provided prompts.';
  }
  return (
    SYSTEM_PROMPTS[purpose] ||
    'You are a helpful AI assistant. Please help with the requested task.'
  );
}
