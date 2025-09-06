'use client';

import { Sparkles, Check, MessageSquare, FileText, Zap } from 'lucide-react';
import { Suggestion } from '@/lib/types/ai';

type AiSuggestionsPanelProps = {
  content: string;
  suggestions?: Suggestion[];
  onGenerateSuggestions?: () => void;
  isGenerating?: boolean;
  onApplySuggestion?: (suggestionId: string) => void;
};

function EmptyState() {
  return (
    <div className='text-center py-8'>
      <Sparkles size={32} className='mx-auto mb-3 text-base-content/30' />
      <p className='text-sm text-base-content/50'>
        Start writing to get AI suggestions
      </p>
    </div>
  );
}

function NoSuggestionsState({
  onGenerateSuggestions,
  isGenerating,
}: {
  onGenerateSuggestions?: () => void;
  isGenerating?: boolean;
}) {
  return (
    <div className='text-center py-8'>
      <Sparkles size={32} className='mx-auto mb-3 text-base-content/30' />
      <p className='text-sm text-base-content/50 mb-4'>No suggestions yet</p>
      <button
        onClick={onGenerateSuggestions}
        disabled={isGenerating}
        className='btn btn-primary btn-sm'
      >
        <Sparkles size={16} className='mr-2' />
        {isGenerating ? 'Generating...' : 'Generate Suggestions'}
      </button>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  onApply,
}: {
  suggestion: Suggestion;
  onApply: (id: string) => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'rewrite':
        return <Sparkles size={16} />;
      case 'tone':
        return <MessageSquare size={16} />;
      case 'summary':
        return <FileText size={16} />;
      case 'improvement':
        return <Zap size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  const onApplyHandler = () => onApply(suggestion.id);

  return (
    <div
      className={`card border transition-all ${
        suggestion.applied
          ? 'bg-success/10 border-success/20'
          : 'bg-base-100 border-base-300'
      }`}
    >
      <div className='card-body p-4'>
        <div className='flex items-start justify-between mb-2'>
          <div className='flex items-center space-x-2'>
            <div className='text-primary'>{getIcon(suggestion.type)}</div>
            <h4 className='font-medium text-sm'>{suggestion.title}</h4>
          </div>
          {suggestion.applied && (
            <div className='text-success'>
              <Check size={16} />
            </div>
          )}
        </div>

        <p className='text-xs text-base-content/50 mb-3'>
          {suggestion.description}
        </p>

        <div className='bg-base-200 rounded-lg p-3 mb-3'>
          <p className='text-sm'>{suggestion.suggestion}</p>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={onApplyHandler}
            className={`btn btn-xs ${
              suggestion.applied ? 'btn-success' : 'btn-primary'
            }`}
            disabled={suggestion.applied}
          >
            {suggestion.applied ? 'Applied' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestionsList({
  suggestions,
  onApplySuggestion,
}: {
  suggestions: Suggestion[];
  onApplySuggestion?: (suggestionId: string) => void;
}) {
  return (
    <>
      {suggestions.map(suggestion => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onApply={onApplySuggestion || (() => {})}
        />
      ))}
    </>
  );
}

export function AiSuggestionsPanel({
  content,
  suggestions = [],
  onGenerateSuggestions,
  isGenerating = false,
  onApplySuggestion,
}: AiSuggestionsPanelProps) {
  const hasContent = content.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;

  const renderContent = () => {
    if (!hasContent) {
      return <EmptyState />;
    }

    if (!hasSuggestions) {
      return (
        <NoSuggestionsState
          onGenerateSuggestions={onGenerateSuggestions}
          isGenerating={isGenerating}
        />
      );
    }

    return (
      <SuggestionsList
        suggestions={suggestions}
        onApplySuggestion={onApplySuggestion}
      />
    );
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='p-4 border-b border-base-300'>
        <h3 className='font-semibold flex items-center'>
          <Sparkles size={20} className='mr-2 text-primary' />
          AI Suggestions
        </h3>
        <p className='text-sm text-base-content/50 mt-1'>
          Get AI-powered writing suggestions
        </p>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {renderContent()}
      </div>

      {hasContent && hasSuggestions && (
        <div className='p-4 border-t border-base-300'>
          <button
            className='btn btn-outline btn-sm w-full'
            onClick={onGenerateSuggestions}
            disabled={isGenerating}
          >
            <Sparkles size={16} className='mr-2' />
            {isGenerating ? 'Generating...' : 'Generate More Suggestions'}
          </button>
        </div>
      )}
    </div>
  );
}
