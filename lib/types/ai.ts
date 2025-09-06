export type Suggestion = {
  id: string;
  type: 'rewrite' | 'tone' | 'summary' | 'improvement';
  title: string;
  description: string;
  suggestion: string;
  applied: boolean;
};

export type GenerateSuggestionsRequest = {
  content: string;
  maxSuggestions?: number;
};

export type GenerateSuggestionsResponse = {
  suggestions: Suggestion[];
};

export type ImproveTextRequest = {
  text: string;
  tone?: string;
  style?: string;
};

export type ImproveTextResponse = {
  improvedText: string;
};

export type AdjustToneRequest = {
  text: string;
  tone: string;
};

export type AdjustToneResponse = {
  adjustedText: string;
};

export type SummarizeTextRequest = {
  text: string;
  style: 'paragraph' | 'bullet' | 'summary';
};

export type SummarizeTextResponse = {
  summary: string;
};
