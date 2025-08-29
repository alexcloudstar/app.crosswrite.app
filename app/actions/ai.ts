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
  extractTagsSchema,
  generateThumbnailSchema,
  type ImproveTextInput,
  type AdjustToneInput,
  type SummarizeTextInput,
  type GenerateSuggestionsInput,
  type ExtractTagsInput,
  type GenerateThumbnailInput,
} from '@/lib/validators/ai';
import { db } from '@/db/client';
import { userUsage } from '@/db/schema/user-usage';
import { planService } from '@/lib/plan-service';
import logger from '@/lib/logger';

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
    logger.error('Failed to track AI usage:', { error, userId, action });
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
    logger.error('Improve text failed:', { error });
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
    logger.error('Adjust tone failed:', { error });
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
    logger.error('Summarize text failed:', { error });
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
    logger.error('Generate suggestions failed:', { error });
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to generate suggestions'
    );
  }
}

export async function extractTags(input: ExtractTagsInput) {
  try {
    const user = await requireAuth();
    const validatedInput = extractTagsSchema.parse(input);

    if (
      !(await planService.canUserUseAIFeature(user.id, 'aiSuggestionsUsed'))
    ) {
      return errorResult('AI features are not available for your plan');
    }

    let contentToAnalyze = validatedInput.content;
    if (contentToAnalyze.length > 11000) {
      contentToAnalyze =
        contentToAnalyze.substring(0, 7000) +
        '\n\n[...content truncated...]\n\n' +
        contentToAnalyze.substring(contentToAnalyze.length - 4000);
    }

    const prompt = PROMPT_TEMPLATES.extractTags(
      contentToAnalyze,
      validatedInput.maxTags
    );

    const response = await aiProvider.invoke({
      purpose: 'extractTags',
      input: prompt,
      modelConfig: { temperature: 0.3, maxTokens: 500 },
    });

    const tags = parseTagsFromResponse(response, validatedInput.maxTags);

    await trackAIUsage(user.id, 'aiSuggestionsUsed');

    return await successResult({ tags });
  } catch (error) {
    logger.error('Extract tags failed:', { error });
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to extract tags'
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

    const prompt = PROMPT_TEMPLATES.generateThumbnail(validatedInput.prompt);

    const images = await aiProvider.generateImage(prompt, '1792x1024');

    await trackAIUsage(user.id, 'thumbnailsGenerated');

    return await successResult({ images });
  } catch (error) {
    logger.error('Generate thumbnail failed:', { error });
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
      // If we have a previous suggestion with content, save it
      if (
        currentSuggestion.title &&
        currentSuggestion.description &&
        currentSuggestion.suggestion
      ) {
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

  // Don't forget to add the last suggestion if it's complete
  if (
    currentSuggestion.title &&
    currentSuggestion.description &&
    currentSuggestion.suggestion
  ) {
    suggestions.push(currentSuggestion);
  }

  return suggestions.slice(0, maxSuggestions);
}

function parseTagsFromResponse(response: string, maxTags: number) {
  const lines = response.split('\n').filter(line => line.trim());
  const tags: string[] = [];

  for (const line of lines) {
    const tag = line.trim();
    if (tag && !tag.startsWith('-') && !tag.startsWith('Tags:')) {
      tags.push(tag);
    }
  }

  return tags.slice(0, maxTags);
}
