'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { drafts, userUsage } from '@/db/schema';
import {
  requireAuth,
  successResult,
  errorResult,
  handleDatabaseError,
} from './_utils';
import { callTextModel, callImageModel } from '@/lib/ai/provider';
import {
  suggestionsSchema,
  improveSchema,
  toneSchema,
  expandSchema,
  summarizeSchema,
  translateSchema,
  seoSchema,
  thumbnailSchema,
  analyzeSchema,
} from '@/lib/validators/ai';

// Helper function to track AI usage
async function trackAiUsage(
  userId: string,
  action: 'suggestions' | 'thumbnails'
) {
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}`;

  try {
    // First try to get existing usage record
    const [existing] = await db
      .select()
      .from(userUsage)
      .where(
        and(eq(userUsage.userId, userId), eq(userUsage.monthYear, monthYear))
      )
      .limit(1);

    if (existing) {
      // Update existing record
      await db
        .update(userUsage)
        .set({
          aiSuggestionsUsed:
            action === 'suggestions'
              ? (existing.aiSuggestionsUsed || 0) + 1
              : existing.aiSuggestionsUsed || 0,
          thumbnailsGenerated:
            action === 'thumbnails'
              ? (existing.thumbnailsGenerated || 0) + 1
              : existing.thumbnailsGenerated || 0,
          updatedAt: now,
        })
        .where(
          and(eq(userUsage.userId, userId), eq(userUsage.monthYear, monthYear))
        );
    } else {
      // Insert new record
      await db.insert(userUsage).values({
        userId,
        monthYear,
        aiSuggestionsUsed: action === 'suggestions' ? 1 : 0,
        thumbnailsGenerated: action === 'thumbnails' ? 1 : 0,
      });
    }
  } catch (error) {
    console.error('Failed to track AI usage:', error);
    // Don't fail the main operation if usage tracking fails
  }
}

// Helper function to get draft content if draftId is provided
async function getDraftContent(
  draftId: string,
  userId: string
): Promise<string> {
  const [draft] = await db
    .select({ content: drafts.content })
    .from(drafts)
    .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)))
    .limit(1);

  if (!draft) {
    throw new Error('Draft not found or access denied');
  }

  return draft.content;
}

export async function getSuggestions(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = suggestionsSchema.parse(input);

    let text = validated.text;

    // If draftId is provided, fetch the draft content
    if (validated.draftId) {
      text = await getDraftContent(validated.draftId, session.id);
    }

    if (!text) {
      return errorResult('Text content is required');
    }

    const response = await callTextModel('suggestions', text, {}, session.id);

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    return successResult({
      suggestions: response.split('\n').filter(line => line.trim()),
      count: validated.maxIdeas,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function improveContent(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = improveSchema.parse(input);

    const response = await callTextModel(
      'improve',
      validated.text,
      {},
      session.id
    );

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    return successResult({
      improvedText: response,
      goals: validated.goals,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function adjustTone(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = toneSchema.parse(input);

    const response = await callTextModel(
      'tone',
      validated.text,
      {},
      session.id
    );

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    return successResult({
      adjustedText: response,
      tone: validated.tone,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function expandContent(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = expandSchema.parse(input);

    const response = await callTextModel(
      'expand',
      validated.text,
      {},
      session.id
    );

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    return successResult({
      expandedText: response,
      targetWords: validated.targetWords,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function summarizeContent(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = summarizeSchema.parse(input);

    const response = await callTextModel(
      'summarize',
      validated.text,
      {},
      session.id
    );

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    return successResult({
      summary: response,
      style: validated.style,
      targetWords: validated.targetWords,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function translateContent(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = translateSchema.parse(input);

    const response = await callTextModel(
      'translate',
      validated.text,
      {},
      session.id
    );

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    return successResult({
      translatedText: response,
      targetLanguage: validated.to,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function generateSeo(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = seoSchema.parse(input);

    const response = await callTextModel(
      'seo',
      validated.text || '',
      {},
      session.id
    );

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    // Parse the response to extract title, description, and keywords
    // This is a simple parsing approach - in production you might want more robust parsing
    const lines = response.split('\n').filter(line => line.trim());

    return successResult({
      seoTitle: validated.title || lines[0] || '',
      seoDescription: validated.description || lines[1] || '',
      keywords: lines.slice(2).map(line => line.toLowerCase().trim()),
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function generateThumbnail(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = thumbnailSchema.parse(input);

    // Create a prompt for the thumbnail
    const prompt = `Create a ${
      validated.style
    } thumbnail for an article titled "${validated.title}"${
      validated.tags?.length ? ` with tags: ${validated.tags.join(', ')}` : ''
    }. The image should be in ${
      validated.aspect
    } aspect ratio and suitable for social media.`;

    const imageUrl = await callImageModel('thumbnail', prompt, session.id);

    // Track usage
    await trackAiUsage(session.id, 'thumbnails');

    return successResult({
      imageUrl,
      title: validated.title,
      style: validated.style,
      aspect: validated.aspect,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}

export async function analyzeContent(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = analyzeSchema.parse(input);

    const response = await callTextModel(
      'analyze',
      validated.text,
      {},
      session.id
    );

    // Track usage
    await trackAiUsage(session.id, 'suggestions');

    return successResult({
      analysis: response,
      textLength: validated.text.length,
    });
  } catch (error) {
    return errorResult(handleDatabaseError(error));
  }
}
