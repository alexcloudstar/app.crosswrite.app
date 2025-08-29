export const PROMPT_TEMPLATES = {
  improveText: (text: string, goals?: string[]) => {
    const goalsText = goals?.length ? `\n\nGoals: ${goals.join(', ')}` : '';
    return `Please improve the following text to make it more engaging, clear, and professional. Focus on better flow, stronger language, and improved readability.${goalsText}

Important: Use regular hyphens (-) instead of em dashes (—) or en dashes (–).

Text to improve:
${text}

Improved version:`;
  },

  adjustTone: (text: string, tone: string) => {
    const toneInstructions = {
      professional: 'formal, business-like, and authoritative',
      casual: 'relaxed, conversational, and approachable',
      friendly: 'warm, welcoming, and personable',
      academic: 'scholarly, formal, and research-oriented',
    };

    const instruction =
      toneInstructions[tone as keyof typeof toneInstructions] ||
      toneInstructions.friendly;

    return `Please rewrite the following text to have a ${instruction} tone while maintaining the same meaning and key information.

Important: Use regular hyphens (-) instead of em dashes (—) or en dashes (–).

Original text:
${text}

${tone.charAt(0).toUpperCase() + tone.slice(1)} version:`;
  },

  summarizeText: (
    text: string,
    style: string = 'paragraph',
    targetWords?: number
  ) => {
    const wordLimit = targetWords
      ? ` (approximately ${targetWords} words)`
      : '';
    const formatInstruction =
      style === 'bullets'
        ? 'Provide a bullet-point summary with key points.'
        : 'Provide a concise paragraph summary.';

    return `Please summarize the following text${wordLimit}. ${formatInstruction} Focus on the main ideas and key takeaways.

Text to summarize:
${text}

Summary:`;
  },

  generateSuggestions: (content: string, maxSuggestions: number = 4) => {
    return `Analyze the following content and provide exactly ${maxSuggestions} specific writing improvement suggestions. Each suggestion should be actionable and include:
1. A clear title
2. A brief description of the improvement
3. A specific suggestion or example

Content to analyze:
${content}

Provide exactly ${maxSuggestions} suggestions in this exact format (one suggestion per block):

- Title: [Suggestion Title]
- Description: [Brief description of the improvement]
- Suggestion: [Specific improvement advice]

- Title: [Suggestion Title]
- Description: [Brief description of the improvement]
- Suggestion: [Specific improvement advice]

Continue this format for all ${maxSuggestions} suggestions.`;
  },

  extractTags: (content: string, maxTags: number = 5) => {
    return `Analyze the following content and extract ${maxTags} relevant tags that would help with content discovery and categorization.

Guidelines for tag extraction:
- Focus on key topics, technologies, concepts, and themes
- Include both broad and specific tags
- Use single words or short phrases (2-3 words max)
- Avoid generic terms like "article", "post", "content"
- Prioritize tags that would help readers find this content
- Consider technical terms, frameworks, languages, and methodologies mentioned

Content to analyze:
${content}

Provide exactly ${maxTags} tags, one per line, in this format:
tag1
tag2
tag3
...

Tags:`;
  },

  generateThumbnail: (prompt: string) => {
    return `Create a realistic, professional blog header image (1792x1024) based on this description: ${prompt}

The image should be:
- Photorealistic and natural-looking, not AI-generated
- Professional and clean, suitable for a tech blog or professional website
- High-quality with realistic lighting and shadows
- Subtle and elegant, avoiding overly dramatic or artificial effects
- Focus on real objects, textures, and environments
- Use natural color palettes and realistic composition
- Avoid cartoonish, overly saturated, or obviously AI-generated elements
- Suitable for digital publishing and social media sharing`;
  },
};
