'use server';

// AI Server Actions for Cross Write
// Implements: improveText, adjustTone, summarizeText, generateSuggestions, generateThumbnail
// These actions are required by the UI components in EditorToolbar, AiSuggestionsPanel, and ThumbnailGeneratorModal

import { eq, and, sql } from 'drizzle-orm';
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
import { users } from '@/db/schema/auth';
import { PLAN_LIMITS } from '@/lib/plans';

// Helper function to track AI usage
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
    // Try to update existing record
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

    // If no record was updated, create a new one
    if (result.length === 0) {
      await db.insert(userUsage).values({
        userId,
        monthYear,
        [action]: 1,
      });
    }
  } catch (error) {
    console.error('Failed to track AI usage:', error);
    // Don't fail the main action if usage tracking fails
  }
}

// Helper function to get user plan tier
async function getUserPlanTier(userId: string): Promise<string> {
  const userRecord = await db
    .select({ planTier: users.planTier })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return userRecord[0]?.planTier || 'free';
}

// Helper function to check plan limits
function checkPlanLimits(
  userPlan: string,
  action: 'aiSuggestionsUsed' | 'thumbnailsGenerated'
): boolean {
  // Map planTier to planId
  const planMap: Record<string, string> = {
    free: 'FREE',
    pro: 'PRO',
  };
  const planId = planMap[userPlan] || 'FREE';

  const limits = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS];
  if (!limits?.aiEnabled) return false;

  if (action === 'thumbnailsGenerated' && limits.monthlyThumbGen === 0)
    return false;

  return true;
}

export async function improveText(input: ImproveTextInput) {
  try {
    const user = await requireAuth();

    // Get user's plan tier from database
    const planTier = await getUserPlanTier(user.id);

    // Validate input
    const validatedInput = improveTextSchema.parse(input);

    // Check plan limits
    if (!checkPlanLimits(planTier, 'aiSuggestionsUsed')) {
      return errorResult('AI features are not available for your plan');
    }

    // Generate prompt
    const prompt = PROMPT_TEMPLATES.improveText(
      validatedInput.text,
      validatedInput.goals
    );

    // Call AI provider
    const improvedText = await aiProvider.invoke({
      purpose: 'improveText',
      input: prompt,
      modelConfig: { temperature: 0.7, maxTokens: 2000 },
    });

    // Track usage
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

    // Get user's plan tier from database
    const planTier = await getUserPlanTier(user.id);

    // Validate input
    const validatedInput = adjustToneSchema.parse(input);

    // Check plan limits
    if (!checkPlanLimits(planTier, 'aiSuggestionsUsed')) {
      return errorResult('AI features are not available for your plan');
    }

    // Generate prompt
    const prompt = PROMPT_TEMPLATES.adjustTone(
      validatedInput.text,
      validatedInput.tone
    );

    // Call AI provider
    const adjustedText = await aiProvider.invoke({
      purpose: 'adjustTone',
      input: prompt,
      modelConfig: { temperature: 0.8, maxTokens: 1500 },
    });

    // Track usage
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

    // Get user's plan tier from database
    const planTier = await getUserPlanTier(user.id);

    // Validate input
    const validatedInput = summarizeTextSchema.parse(input);

    // Check plan limits
    if (!checkPlanLimits(planTier, 'aiSuggestionsUsed')) {
      return errorResult('AI features are not available for your plan');
    }

    // Generate prompt
    const prompt = PROMPT_TEMPLATES.summarizeText(
      validatedInput.text,
      validatedInput.style,
      validatedInput.targetWords
    );

    // Call AI provider
    const summary = await aiProvider.invoke({
      purpose: 'summarizeText',
      input: prompt,
      modelConfig: { temperature: 0.5, maxTokens: 1000 },
    });

    // Track usage
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

    // Get user's plan tier from database
    const planTier = await getUserPlanTier(user.id);

    // Validate input
    const validatedInput = generateSuggestionsSchema.parse(input);

    // Check plan limits
    if (!checkPlanLimits(planTier, 'aiSuggestionsUsed')) {
      return errorResult('AI features are not available for your plan');
    }

    // Generate prompt
    const prompt = PROMPT_TEMPLATES.generateSuggestions(
      validatedInput.content,
      validatedInput.maxSuggestions
    );

    // Call AI provider
    const response = await aiProvider.invoke({
      purpose: 'generateSuggestions',
      input: prompt,
      modelConfig: { temperature: 0.7, maxTokens: 1500 },
    });

    // Parse suggestions from response (simple parsing for now)
    const suggestions = parseSuggestionsFromResponse(
      response,
      validatedInput.maxSuggestions
    );

    // Track usage
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

    // Get user's plan tier from database
    const planTier = await getUserPlanTier(user.id);

    // Validate input
    const validatedInput = generateThumbnailSchema.parse(input);

    // Check plan limits
    if (!checkPlanLimits(planTier, 'thumbnailsGenerated')) {
      return errorResult('Thumbnail generation is not available for your plan');
    }

    // Generate prompt
    const prompt = PROMPT_TEMPLATES.generateThumbnail(
      validatedInput.prompt,
      validatedInput.aspectRatio
    );

    // Determine image size based on selection
    const sizeMap = {
      small: '1024x1024',
      medium: '1792x1024',
      large: '1792x1024',
    };
    const imageSize = sizeMap[validatedInput.size];

    // Call AI provider for image generation
    const images = await aiProvider.generateImage(prompt, imageSize);

    // Track usage
    await trackAIUsage(user.id, 'thumbnailsGenerated');

    return await successResult({ images });
  } catch (error) {
    console.error('Generate thumbnail failed:', error);
    return await errorResult(
      error instanceof Error ? error.message : 'Failed to generate thumbnail'
    );
  }
}

// Helper function to parse suggestions from AI response
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
    } else if (line.startsWith('- Description:')) {
      currentSuggestion.description = line.replace('- Description:', '').trim();
    } else if (line.startsWith('- Suggestion:')) {
      currentSuggestion.suggestion = line.replace('- Suggestion:', '').trim();
    }
  }

  // Add the last suggestion
  if (Object.keys(currentSuggestion).length > 0) {
    suggestions.push(currentSuggestion);
  }

  return suggestions.slice(0, maxSuggestions);
}
