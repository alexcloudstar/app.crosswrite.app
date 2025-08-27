'use server';

import { and, eq, sql } from 'drizzle-orm';
import { requireAuth, successResult, errorResult } from './_utils';
import { aiProvider } from '@/lib/ai/provider';
import { PROMPT_TEMPLATES } from '@/lib/ai/prompt-templates';
import {
  improveTextSchema,
  adjustToneSchema,
  summarizeTextSchema,
  generateSuggestionsSchema,
  generateThumbnailSchema,
  type ImproveTextInput,
  type AdjustToneInput,
  type SummarizeTextInput,
  type GenerateSuggestionsInput,
  type GenerateThumbnailInput,
} from '@/lib/validators/ai';
import { db } from '@/db/client';
import { userUsage } from '@/db/schema/user-usage';
import { planService } from '@/lib/plan-service';

async function trackAIUsage(
  userId: string,
  action: 'aiSuggestionsUsed' | 'thumbnailsGenerated'
) {
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}`;

  try {
    const result = await db
      .update(userUsage)
      .set({
        [action]: sql`${userUsage[action]} + 1`,
        updatedAt: now,
      })
      .where(
        and(eq(userUsage.userId, userId), eq(userUsage.monthYear, monthYear))
      )
      .returning();

    if (!result.length) {
      await db.insert(userUsage).values({
        userId,
        monthYear,
        [action]: 1,
      });
    }
  } catch (error) {
    console.error('Failed to track AI usage:', error);
  }
}

export async function improveText(input: ImproveTextInput) {
  try {
    const user = await requireAuth();
    const validatedInput = improveTextSchema.parse(input);

    if (
      !(await planService.canUserUseAIFeature(user.id, 'aiSuggestionsUsed'))
    ) {
      return errorResult('AI features are not available for your plan');
    }

    const prompt = PROMPT_TEMPLATES.improveText(
      validatedInput.text,
      validatedInput.goals
    );

    const improvedText = await aiProvider.invoke({
      purpose: 'improveText',
      input: prompt,
      modelConfig: { temperature: 0.7, maxTokens: 2000 },
    });

    await trackAIUsage(user.id, 'aiSuggestionsUsed');

    return await successResult({ improvedText });
  } catch (error) {
    console.error('Improve text failed:', error);
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to improve text'
    );
  }
}

export async function adjustTone(input: AdjustToneInput) {
  try {
    const user = await requireAuth();
    const validatedInput = adjustToneSchema.parse(input);

    if (
      !(await planService.canUserUseAIFeature(user.id, 'aiSuggestionsUsed'))
    ) {
      return errorResult('AI features are not available for your plan');
    }

    const prompt = PROMPT_TEMPLATES.adjustTone(
      validatedInput.text,
      validatedInput.tone
    );

    const adjustedText = await aiProvider.invoke({
      purpose: 'adjustTone',
      input: prompt,
      modelConfig: { temperature: 0.8, maxTokens: 1500 },
    });

    await trackAIUsage(user.id, 'aiSuggestionsUsed');

    return await successResult({ adjustedText });
  } catch (error) {
    console.error('Adjust tone failed:', error);
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to adjust tone'
    );
  }
}

export async function summarizeText(input: SummarizeTextInput) {
  try {
    const user = await requireAuth();
    const validatedInput = summarizeTextSchema.parse(input);

    if (
      !(await planService.canUserUseAIFeature(user.id, 'aiSuggestionsUsed'))
    ) {
      return errorResult('AI features are not available for your plan');
    }

    const prompt = PROMPT_TEMPLATES.summarizeText(
      validatedInput.text,
      validatedInput.style,
      validatedInput.targetWords
    );

    const summary = await aiProvider.invoke({
      purpose: 'summarizeText',
      input: prompt,
      modelConfig: { temperature: 0.5, maxTokens: 1000 },
    });

    await trackAIUsage(user.id, 'aiSuggestionsUsed');

    return await successResult({ summary });
  } catch (error) {
    console.error('Summarize text failed:', error);
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to summarize text'
    );
  }
}

export async function generateSuggestions(input: GenerateSuggestionsInput) {
  try {
    const user = await requireAuth();
    const validatedInput = generateSuggestionsSchema.parse(input);

    if (
      !(await planService.canUserUseAIFeature(user.id, 'aiSuggestionsUsed'))
    ) {
      return errorResult('AI features are not available for your plan');
    }

    const prompt = PROMPT_TEMPLATES.generateSuggestions(
      validatedInput.content,
      validatedInput.maxSuggestions
    );

    const response = await aiProvider.invoke({
      purpose: 'generateSuggestions',
      input: prompt,
      modelConfig: { temperature: 0.7, maxTokens: 1500 },
    });

    const suggestions = parseSuggestionsFromResponse(
      response,
      validatedInput.maxSuggestions
    );

    await trackAIUsage(user.id, 'aiSuggestionsUsed');

    return await successResult({ suggestions });
  } catch (error) {
    console.error('Generate suggestions failed:', error);
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to generate suggestions'
    );
  }
}

export async function generateThumbnail(input: GenerateThumbnailInput) {
  try {
    const user = await requireAuth();
    const validatedInput = generateThumbnailSchema.parse(input);

    if (
      !(await planService.canUserUseAIFeature(user.id, 'thumbnailsGenerated'))
    ) {
      return errorResult('Thumbnail generation is not available for your plan');
    }

    const prompt = PROMPT_TEMPLATES.generateThumbnail(
      validatedInput.prompt,
      validatedInput.aspectRatio
    );

    const sizeMap = {
      small: '1024x1024',
      medium: '1792x1024',
      large: '1792x1024',
    };
    const imageSize = sizeMap[validatedInput.size];

    const images = await aiProvider.generateImage(prompt, imageSize);

    await trackAIUsage(user.id, 'thumbnailsGenerated');

    return await successResult({ images });
  } catch (error) {
    console.error('Generate thumbnail failed:', error);
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to generate thumbnail'
    );
  }
}

function parseSuggestionsFromResponse(
  response: string,
  maxSuggestions: number
) {
  const suggestions: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    suggestion: string;
    applied: boolean;
  }> = [];
  const lines = response.split('\n').filter(line => line.trim());

  let currentSuggestion: {
    id: string;
    type: string;
    title: string;
    description: string;
    suggestion: string;
    applied: boolean;
  } = {
    id: '',
    type: 'improvement',
    title: '',
    description: '',
    suggestion: '',
    applied: false,
  };

  for (const line of lines) {
    if (line.startsWith('- Title:')) {
      if (Object.keys(currentSuggestion).length > 0) {
        suggestions.push(currentSuggestion);
      }

      currentSuggestion = {
        id: `suggestion-${suggestions.length + 1}`,
        type: 'improvement',
        title: line.replace('- Title:', '').trim(),
        description: '',
        suggestion: '',
        applied: false,
      };
    }

    if (line.startsWith('- Description:')) {
      currentSuggestion.description = line.replace('- Description:', '').trim();
    }

    if (line.startsWith('- Suggestion:')) {
      currentSuggestion.suggestion = line.replace('- Suggestion:', '').trim();
    }
  }

  if (Object.keys(currentSuggestion).length > 0) {
    suggestions.push(currentSuggestion);
  }

  return suggestions.slice(0, maxSuggestions);
}
