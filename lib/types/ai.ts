export interface Suggestion {
  id: string;
  type: 'rewrite' | 'tone' | 'summary' | 'improvement';
  title: string;
  description: string;
  suggestion: string;
  applied: boolean;
}

export interface GenerateSuggestionsRequest {
  content: string;
  maxSuggestions?: number;
}

export interface GenerateSuggestionsResponse {
  suggestions: Suggestion[];
}

export interface ImproveTextRequest {
  text: string;
  tone?: string;
  style?: string;
}

export interface ImproveTextResponse {
  improvedText: string;
}

export interface AdjustToneRequest {
  text: string;
  tone: string;
}

export interface AdjustToneResponse {
  adjustedText: string;
}

export interface SummarizeTextRequest {
  text: string;
  style: 'paragraph' | 'bullet' | 'summary';
}

export interface SummarizeTextResponse {
  summary: string;
}
