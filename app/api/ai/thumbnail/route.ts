import { NextRequest, NextResponse } from 'next/server';
import { PLAN_LIMITS } from '@/lib/plans';

interface ThumbnailRequest {
  prompt: string;
  aspectRatio: string;
  size: string;
  planId: string;
  usage: {
    thumbnailsThisMonth: number;
  };
  byokKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ThumbnailRequest = await request.json();
    const { planId, usage, byokKey } = body;

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

    // Check BYOK requirement for Free plan
    if (planId === 'FREE' && !byokKey) {
      return NextResponse.json(
        { error: 'BYOK (Bring Your Own Key) is required for Free plan' },
        { status: 403 }
      );
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
    // In a real implementation, this would call OpenAI's DALL-E API or similar
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
