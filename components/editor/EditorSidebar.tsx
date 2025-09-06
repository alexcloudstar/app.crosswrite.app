'use client';

import { AiSuggestionsPanel } from '@/components/editor/AiSuggestionsPanel';
import { TagManager } from '@/components/editor/TagManager';
import { Suggestion } from '@/lib/types/ai';

type EditorSidebarProps = {
  content: string;
  suggestions: Suggestion[];
  onGenerateSuggestions: () => void;
  isGeneratingSuggestions: boolean;
  onApplySuggestion: (suggestionId: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  title: string;
  isLoading: boolean;
};

export const EditorSidebar = ({
  content,
  suggestions,
  onGenerateSuggestions,
  isGeneratingSuggestions,
  onApplySuggestion,
  tags,
  onTagsChange,
  title,
  isLoading,
}: EditorSidebarProps) => {
  return (
    <div className='w-80 border-l border-base-300 bg-base-200 flex-shrink-0 flex flex-col'>
      <div className='flex-1 overflow-y-auto'>
        <AiSuggestionsPanel
          content={content}
          suggestions={suggestions}
          onGenerateSuggestions={onGenerateSuggestions}
          isGenerating={isGeneratingSuggestions}
          onApplySuggestion={onApplySuggestion}
        />
      </div>

      <div className='border-t border-base-300 p-4'>
        <TagManager
          tags={tags}
          onTagsChange={onTagsChange}
          content={content}
          title={title}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
