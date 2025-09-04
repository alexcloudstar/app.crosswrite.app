import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import {
  getApiKeyForGeneration,
  getKeySource,
} from '@/lib/config/serverConfig';
import { INPUT_LIMITS } from '@/lib/constants';
import logger from '@/lib/logger';

type AllowedModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-3.5-turbo';

type ModelConfig = {
  model?: AllowedModel;
  temperature?: number;
  maxTokens?: number;
};

type InvokeParams = {
  purpose: string;
  input: string;
  modelConfig?: ModelConfig;
};

function getRateLimitKey(userId: string, purpose: string): string {
  return `${userId}:${purpose}`;
}

export class AIProvider {
  private client: OpenAI;

  constructor() {
    const apiKey = getApiKeyForGeneration();
    this.client = new OpenAI({ apiKey });
  }

  async invoke({ purpose, input, modelConfig }: InvokeParams): Promise<string> {
    const maxLength = INPUT_LIMITS[purpose] || 5000;
    if (input.length > maxLength) {
      throw new Error(
        `Input too long. Maximum ${maxLength} characters allowed for ${purpose}.`
      );
    }

    const userId = 'temp';
    const rateLimitResult = checkRateLimit(
      getRateLimitKey(userId, purpose),
      5,
      60000
    );
    if (!rateLimitResult.allowed) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    const model = modelConfig?.model || 'gpt-4o-mini';
    const temperature = modelConfig?.temperature ?? 0.7;
    const maxTokens = modelConfig?.maxTokens ?? 1000;

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: input }],
        temperature,
        max_tokens: maxTokens,
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from AI provider');
      }

      return result;
    } catch (error) {
      logger.error(`AI invocation failed for ${purpose}:`, {
        error,
        purpose,
        input: input.substring(0, 100),
      });
      throw new Error('AI service temporarily unavailable');
    }
  }

  async generateImage(
    prompt: string,
    size: string = '1024x1024'
  ): Promise<string[]> {
    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: size as '1024x1024' | '1792x1024' | '1024x1792',
      });

      return response.data?.map(img => img.url!).filter(Boolean) || [];
    } catch (error) {
      logger.error('Image generation failed:', {
        error,
        prompt: prompt.substring(0, 100),
      });
      throw new Error('Image generation failed');
    }
  }

  getKeySource(): string {
    return getKeySource();
  }
}

export const aiProvider = new AIProvider();
