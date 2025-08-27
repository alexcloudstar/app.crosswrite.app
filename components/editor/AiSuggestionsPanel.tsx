'use client';

import { useState } from 'react';
import {
  Sparkles,
  Check,
  Copy,
  MessageSquare,
  FileText,
  Zap,
  Loader2,
} from 'lucide-react';
import { getSuggestions } from '@/app/actions/ai';

interface AiSuggestionsPanelProps {
  content: string;
  draftId?: string;
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
  content,
  draftId,
}: AiSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = (id: string) =>
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, applied: true } : s))
    );

  const handleInsert = (id: string) => {
    console.log('Inserting suggestion:', id);
  };

  const generateSuggestions = async () => {
    if (!content.trim()) {
      alert('Please add some content to get AI suggestions');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getSuggestions({
        text: content,
        draftId,
        maxIdeas: 5,
      });

      if (result.success && result.data) {
        const data = result.data as { suggestions: string[]; count: number };
        const newSuggestions: Suggestion[] = data.suggestions.map(
          (suggestion: string, index: number) => ({
            id: `suggestion-${index}`,
            type: 'improvement' as const,
            title: `Suggestion ${index + 1}`,
            description: 'AI-generated improvement',
            suggestion,
            applied: false,
          })
        );
        setSuggestions(newSuggestions);
      } else {
        alert(result.error || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions');
    } finally {
      setIsLoading(false);
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
                <button
                  onClick={handleInsert.bind(null, suggestion.id)}
                  className='btn btn-ghost btn-xs'
                >
                  <Copy size={12} className='mr-1' />
                  Insert
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='p-4 border-t border-base-300'>
        <button
          className='btn btn-outline btn-sm w-full'
          onClick={generateSuggestions}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className='mr-2 animate-spin' />
          ) : (
            <Sparkles size={16} className='mr-2' />
          )}
          {isLoading ? 'Generating...' : 'Generate Suggestions'}
        </button>
      </div>
    </div>
  );
}
