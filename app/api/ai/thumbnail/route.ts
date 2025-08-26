import { NextRequest, NextResponse } from 'next/server';
import { PLAN_LIMITS } from '@/lib/plans';
import {
  getApiKeyForGeneration,
  getKeySource,
  isHosted,
} from '@/lib/config/serverConfig';
import { checkRateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';

interface ThumbnailRequest {
  prompt: string;
  aspectRatio: string;
  size: string;
  planId: string;
  usage: {
    thumbnailsThisMonth: number;
  };
  // Client-supplied keys are no longer accepted
  byokKey?: string;
  apiKey?: string;
  openaiKey?: string;
  providerKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, 10, 60000); // 10 requests per minute

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    const body: ThumbnailRequest = await request.json();
    const { planId, usage, byokKey, apiKey, openaiKey, providerKey } = body;

    // Reject any client-supplied keys in both modes
    if (byokKey || apiKey || openaiKey || providerKey) {
      return NextResponse.json(
        { error: 'User keys are not accepted in this deployment mode' },
        { status: 400 }
      );
    }

    // Plan validation
    const limits = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS];
    if (!limits) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Check if AI is enabled for this plan
    if (!limits.aiEnabled) {
      return NextResponse.json(
        { error: 'AI features are not available for this plan' },
        { status: 403 }
      );
    }

    // Get the appropriate API key based on deployment mode
    try {
      getApiKeyForGeneration(); // Validate key exists
      // Log the key source used (privacy-safe)
      console.log(`Thumbnail generation using key source: ${getKeySource()}`);
    } catch {
      const message = isHosted()
        ? 'Missing server app key. Contact admin.'
        : 'Set OPENAI_API_KEY in your environment and restart.';

      return NextResponse.json({ error: message }, { status: 500 });
    }

    // Check thumbnail generation limits
    if (limits.monthlyThumbGen === 0) {
      return NextResponse.json(
        { error: 'Thumbnail generation is not available for this plan' },
        { status: 403 }
      );
    }

    if (
      typeof limits.monthlyThumbGen === 'number' &&
      usage.thumbnailsThisMonth >= limits.monthlyThumbGen
    ) {
      return NextResponse.json(
        { error: 'Monthly thumbnail generation limit reached' },
        { status: 429 }
      );
    }

    // Mock AI thumbnail generation
    // In a real implementation, this would call OpenAI's DALL-E API using apiKeyForGeneration
    const mockImages = [
      `https://picsum.photos/800/450?random=${Date.now()}`,
      `https://picsum.photos/800/450?random=${Date.now() + 1}`,
      `https://picsum.photos/800/450?random=${Date.now() + 2}`,
      `https://picsum.photos/800/450?random=${Date.now() + 3}`,
    ];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      images: mockImages,
      usage: {
        thumbnailsThisMonth: usage.thumbnailsThisMonth + 1,
        limit: limits.monthlyThumbGen,
      },
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnails' },
      { status: 500 }
    );
  }
}
