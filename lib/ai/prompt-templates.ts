export const PROMPT_TEMPLATES = {
  improveText: (text: string, goals?: string[]) => {
    const goalsText = goals?.length ? `\n\nGoals: ${goals.join(', ')}` : '';
    return `Please improve the following text to make it more engaging, clear, and professional. Focus on better flow, stronger language, and improved readability.${goalsText}

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
    return `Analyze the following content and provide ${maxSuggestions} specific writing improvement suggestions. Each suggestion should be actionable and include:
1. A clear title
2. A brief description of the improvement
3. A specific suggestion or example

Content to analyze:
${content}

Provide ${maxSuggestions} suggestions in this format:
- Title: [Suggestion Title]
- Description: [Brief description]
- Suggestion: [Specific improvement advice]

Suggestions:`;
  },

  generateThumbnail: (prompt: string, aspectRatio: string) => {
    const aspectInstructions = {
      '16:9':
        'widescreen format, perfect for blog headers and YouTube thumbnails',
      '1:1': 'square format, ideal for social media posts',
      '4:5': 'portrait format, great for Instagram stories',
      '2:1': 'landscape format, suitable for newsletter headers',
    };

    const instruction =
      aspectInstructions[aspectRatio as keyof typeof aspectInstructions] ||
      aspectInstructions['16:9'];

    return `Create a ${instruction} thumbnail image based on this description: ${prompt}

The image should be:
- Visually appealing and modern
- Professional and high-quality
- Relevant to the content
- Suitable for digital publishing`;
  },
};
