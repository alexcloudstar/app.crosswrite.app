// AI Prompt Templates
// Small, composable templates for different AI purposes
// TODO: Add more sophisticated prompt engineering and few-shot examples

export type ToneType =
  | 'friendly'
  | 'professional'
  | 'casual'
  | 'confident'
  | 'empathetic';

export type SeoStyle = 'blog' | 'product' | 'news' | 'tutorial';

export type ThumbnailStyle = 'clean' | 'vibrant' | 'minimal';

// Base system prompts
export const SYSTEM_PROMPTS = {
  suggestions:
    'You are a helpful writing assistant. Provide 3-5 specific, actionable suggestions to improve the given text. Focus on clarity, engagement, and structure. Keep suggestions concise and practical.',

  improve:
    'You are a professional editor. Rewrite the given text to be clearer, more engaging, and better structured while preserving the original meaning and tone.',

  tone: 'You are a tone adjustment specialist. Rewrite the given text to match the requested tone while preserving the original meaning and content.',

  expand:
    'You are a content expansion expert. Elaborate on the given text by adding relevant details, examples, and explanations while maintaining the original structure and flow.',

  summarize:
    'You are a summarization expert. Create a concise summary of the given text, capturing the key points and main ideas.',

  translate:
    'You are a professional translator. Translate the given text to the target language while preserving the original meaning, tone, and formatting. Keep code blocks and technical terms intact where appropriate.',

  seo: 'You are an SEO specialist. Generate an SEO-optimized title, description, and keywords for the given content. Focus on search intent and keyword optimization.',

  analyze:
    'You are a content analysis expert. Analyze the given text for reading level, keyword density, and structure. Provide actionable insights for improvement.',
} as const;

// User prompt builders
export function buildSuggestionsPrompt(
  text: string,
  maxIdeas: number = 5
): string {
  return `Please provide ${maxIdeas} specific, actionable suggestions to improve this text:

${text}

Format each suggestion as a separate line starting with "- "`;
}

export function buildImprovePrompt(text: string, goals?: string[]): string {
  const goalsText = goals?.length ? `\n\nGoals: ${goals.join(', ')}` : '';

  return `Please improve this text to make it clearer, more engaging, and better structured:${goalsText}

${text}`;
}

export function buildTonePrompt(text: string, tone: ToneType): string {
  const toneInstructions = {
    friendly: 'Make the tone warm, approachable, and conversational',
    professional: 'Make the tone formal, authoritative, and business-like',
    casual: 'Make the tone relaxed, informal, and conversational',
    confident: 'Make the tone assertive, bold, and self-assured',
    empathetic: 'Make the tone understanding, compassionate, and supportive',
  };

  return `Please rewrite this text with a ${tone} tone. ${toneInstructions[tone]}:

${text}`;
}

export function buildExpandPrompt(
  text: string,
  outlineHints?: string[],
  targetWords?: number
): string {
  const wordLimit = targetWords
    ? `\n\nTarget word count: ${targetWords} words`
    : '';
  const hints = outlineHints?.length
    ? `\n\nFocus areas: ${outlineHints.join(', ')}`
    : '';

  return `Please expand and elaborate on this text while maintaining its structure and flow:${wordLimit}${hints}

${text}`;
}

export function buildSummarizePrompt(
  text: string,
  style: 'bullets' | 'paragraph' = 'paragraph',
  targetWords?: number
): string {
  const wordLimit = targetWords
    ? `\n\nTarget word count: ${targetWords} words`
    : '';
  const format =
    style === 'bullets' ? 'Format as bullet points' : 'Format as a paragraph';

  return `Please create a ${style} summary of this text. ${format}:${wordLimit}

${text}`;
}

export function buildTranslatePrompt(
  text: string,
  targetLanguage: string
): string {
  return `Please translate this text to ${targetLanguage}. Preserve the original meaning, tone, and formatting. Keep any code blocks, technical terms, or special formatting intact:

${text}`;
}

export function buildSeoPrompt(
  title?: string,
  description?: string,
  text?: string,
  style: SeoStyle = 'blog'
): string {
  const content = text || '';
  const titleText = title ? `\n\nTitle: ${title}` : '';
  const descText = description ? `\n\nDescription: ${description}` : '';

  return `Please generate SEO-optimized metadata for this ${style} content. Provide:
1. An SEO-optimized title (50-60 characters)
2. A meta description (150-160 characters)
3. 5-8 relevant keywords

Content:${titleText}${descText}

${content}`;
}

export function buildThumbnailPrompt(
  title: string,
  tags?: string[],
  style: ThumbnailStyle = 'clean',
  aspect: string = '16:9'
): string {
  const styleInstructions = {
    clean: 'Use a clean, minimalist design with plenty of white space',
    vibrant: 'Use bold colors and dynamic visual elements',
    minimal: 'Use a very simple, stripped-down design with minimal elements',
  };

  const tagsText = tags?.length ? `\nTags: ${tags.join(', ')}` : '';

  return `Create a ${style} thumbnail image for an article titled "${title}". ${styleInstructions[style]}.

Aspect ratio: ${aspect}
${tagsText}

The image should be suitable for social media sharing and represent the article's content effectively.`;
}

export function buildAnalyzePrompt(text: string): string {
  return `Please analyze this text and provide insights on:

1. Reading level (e.g., elementary, middle school, high school, college, professional)
2. Key topics and themes
3. Writing structure and flow
4. Areas for improvement
5. Suggested keywords for SEO

Text to analyze:

${text}`;
}
