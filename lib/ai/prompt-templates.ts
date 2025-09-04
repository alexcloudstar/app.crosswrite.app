import { cleanContentForAI } from '@/lib/validators/common';
import { FIELD_LIMITS } from '@/lib/constants';

export const PROMPT_TEMPLATES = {
  improveText: (text: string, goals?: string[]) => {
    const goalsText = goals?.length ? `\n\nGoals: ${goals.join(', ')}` : '';
    return `Please improve the following text to make it more engaging, clear, and professional. Focus on better flow, stronger language, and improved readability.${goalsText}

Important formatting rules:
- Use regular hyphens (-) instead of em dashes (—) or en dashes (–)
- Maintain proper heading hierarchy: use # for main titles, ## for major sections, ### for subsections, #### for sub-subsections
- Do NOT convert all headings to the same level (e.g., don't make everything ###)
- Preserve the original heading structure and only improve the content

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

Important formatting rules:
- Use regular hyphens (-) instead of em dashes (—) or en dashes (–)
- Maintain proper heading hierarchy: use # for main titles, ## for major sections, ### for subsections, #### for sub-subsections
- Do NOT convert all headings to the same level (e.g., don't make everything ###)
- Preserve the original heading structure and only adjust the tone

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

  generateThumbnail: (articleTitle: string, articleContent: string) => {
    const cleanContent = cleanContentForAI(articleContent);
    const contentPreview = cleanContent.substring(
      0,
      FIELD_LIMITS.contentPreviewLength
    );

    return `Create a blog header image (1792x1024) for the article titled: "${articleTitle}"

  Article content preview: "${contentPreview}"

  This image must look like a real photograph, not a conceptual illustration.

  🔑 STEP-BY-STEP INSTRUCTIONS:
  1. **Scene** → Always depict ONE clear, realistic environment:
     - A modern desk with a laptop or monitor
     - A plain whiteboard with markers
     - Or a single browser window visible on a screen
  2. **Main Subject** → The subject must directly match the article topic:
     - Code editors (VSCode, JetBrains, etc.) if about coding
     - Browser window if about CSS, frontend, or layouts
     - Postman app if about API testing
     - ER diagram, SQL editor, or dbdiagram.io if about databases
     - Terminal window if about Docker or Git
     - Design tools (Figma, Sketch) if about UX/UI
  3. **Clarity** → The focus should be instantly recognizable from the thumbnail alone.
     Use the content preview above to decide the most fitting subject.
  4. **Fallback Rule** → If unsure, always show a laptop on a clean desk with the relevant app or code editor open.

  🚫 DO NOT INCLUDE:
  - Floating icons, cubes, gears, holograms, or abstract shapes
  - Futuristic dashboards, multi-screen walls, or sci-fi control centers
  - Random diagrams, filler charts, or background posters unrelated to the topic
  - Decorative or symbolic overlays (planets, glowing lines, etc.)
  - Generic "techy stock photo" vibes

  ✅ EXAMPLES OF GOOD OUTPUT:
  - "Building a React App" → Laptop on a wooden desk with VSCode open, React code visible, React logo sticker
  - "CSS Grid Layout" → Monitor showing browser window with webpage + visible CSS gridlines
  - "API Testing with Postman" → Postman app on desktop screen showing request/response
  - "Database Design" → Whiteboard with ER diagram drawn in markers OR dbdiagram.io interface on screen
  - "Debugging JavaScript" → Chrome DevTools open with console logs
  - "Docker for Beginners" → Terminal window with Docker commands, Docker whale sticker on laptop
  - "Version Control with Git" → Terminal with git commit / git push commands visible
  - "UX Wireframing" → Figma UI open on screen, with wireframe sketches on nearby notepad

  🎨 STYLE REQUIREMENTS:
  - Photorealistic and natural-looking
  - Natural daylight or warm desk lighting
  - Clean, minimal, modern setup
  - High contrast, sharp details, realistic shadows
  - Professional blog header aesthetic
  - Clear focal point, uncluttered composition

  📌 FINAL RULE:
  The thumbnail must look exactly like a real photo of a workspace or tool in use.
  It must directly illustrate the article’s subject, with no abstract, symbolic, or decorative elements.
  If in doubt, fall back to: a laptop on a desk with the relevant app or editor open.`;
  },
};
