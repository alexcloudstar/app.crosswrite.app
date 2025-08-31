'use server';

import { PROMPT_TEMPLATES } from '@/lib/ai/prompt-templates';
import { aiProvider } from '@/lib/ai/provider';
import { assertWithinLimits } from '@/lib/billing/usage';
import logger from '@/lib/logger';
import {
  adjustToneSchema,
  extractTagsSchema,
  generateSuggestionsSchema,
  generateThumbnailSchema,
  improveTextSchema,
  summarizeTextSchema,
  type AdjustToneInput,
  type ExtractTagsInput,
  type GenerateSuggestionsInput,
  type GenerateThumbnailInput,
  type ImproveTextInput,
  type SummarizeTextInput,
} from '@/lib/validators/ai';
import { errorResult, requireAuth, successResult } from './_utils';

async function checkAndTrackUsage(
  userId: string,
  metric: 'aiSuggestionsUsed' | 'thumbnailsGenerated'
) {
  const result = await assertWithinLimits(userId, metric, 1);

  if (!result.allowed) {
    throw new Error(`Usage limit exceeded for ${metric}`);
  }

  return result.warning;
}

export async function improveText(input: ImproveTextInput) {
  try {
    const user = await requireAuth();
    const validatedInput = improveTextSchema.parse(input);

    const warning = await checkAndTrackUsage(user.id, 'aiSuggestionsUsed');

    const prompt = PROMPT_TEMPLATES.improveText(
      validatedInput.text,
      validatedInput.goals
    );

    const improvedText = await aiProvider.invoke({
      purpose: 'improveText',
      input: prompt,
      modelConfig: { temperature: 0.7, maxTokens: 2000 },
    });

    return await successResult({
      improvedText,
      warning,
    });
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

    const warning = await checkAndTrackUsage(user.id, 'aiSuggestionsUsed');

    const prompt = PROMPT_TEMPLATES.adjustTone(
      validatedInput.text,
      validatedInput.tone
    );

    const adjustedText = await aiProvider.invoke({
      purpose: 'adjustTone',
      input: prompt,
      modelConfig: { temperature: 0.8, maxTokens: 1500 },
    });

    return await successResult({
      adjustedText,
      warning,
    });
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

    const warning = await checkAndTrackUsage(user.id, 'aiSuggestionsUsed');

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

    return await successResult({
      summary,
      warning,
    });
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

    const warning = await checkAndTrackUsage(user.id, 'aiSuggestionsUsed');

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

    return await successResult({
      suggestions,
      warning,
    });
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

    const warning = await checkAndTrackUsage(user.id, 'aiSuggestionsUsed');

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

    return await successResult({
      tags,
      warning,
    });
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

    const warning = await checkAndTrackUsage(user.id, 'thumbnailsGenerated');

    const prompt = PROMPT_TEMPLATES.generateThumbnail(validatedInput.prompt);

    const images = await aiProvider.generateImage(prompt, '1792x1024');

    return await successResult({
      images,
      warning,
    });
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
