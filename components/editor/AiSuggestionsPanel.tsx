'use client';

import { useState } from 'react';
import { Sparkles, Check, MessageSquare, FileText, Zap } from 'lucide-react';

interface AiSuggestionsPanelProps {
  content: string;
  onGenerateSuggestions?: () => void;
  isGenerating?: boolean;
  onApplySuggestion?: (suggestion: string) => void;
}

interface Suggestion {
  id: string;
  type: 'rewrite' | 'tone' | 'summary' | 'improvement';
  title: string;
  description: string;
  suggestion: string;
  applied: boolean;
}

export function AiSuggestionsPanel({
  onGenerateSuggestions,
  isGenerating = false,
  onApplySuggestion,
}: AiSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      type: 'improvement',
      title: 'Improve Introduction',
      description: 'Make the opening more engaging',
      suggestion:
        "Consider starting with a compelling hook or question to grab readers' attention immediately.",
      applied: false,
    },
    {
      id: '2',
      type: 'tone',
      title: 'Adjust Tone',
      description: 'Make it more conversational',
      suggestion:
        'The current tone is quite formal. Consider using more casual language and personal pronouns to connect better with readers.',
      applied: false,
    },
    {
      id: '3',
      type: 'summary',
      title: 'Add Summary',
      description: 'Include a brief overview',
      suggestion:
        "Add a 2-3 sentence summary at the beginning to give readers a quick overview of what they'll learn.",
      applied: false,
    },
    {
      id: '4',
      type: 'rewrite',
      title: 'Rewrite Section',
      description: 'Improve the features section',
      suggestion:
        'The features section could be more benefit-focused. Instead of listing features, explain how each one helps the user.',
      applied: false,
    },
  ]);

  const handleApply = (id: string) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion && onApplySuggestion) {
      onApplySuggestion(suggestion.suggestion);
      setSuggestions(prev =>
        prev.map(s => (s.id === id ? { ...s, applied: true } : s))
      );
    }
  };

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
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
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
                  onClick={handleApply.bind(null, suggestion.id)}
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
        ))}
      </div>

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
    </div>
  );
}
