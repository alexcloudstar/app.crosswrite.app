'use client';

import { useState, useEffect } from 'react';
import { Tag, X, Sparkles } from 'lucide-react';
import { extractTags } from '@/app/actions/ai';
import toast from 'react-hot-toast';

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  content: string;
  title: string;
  disabled?: boolean;
}

export function TagManager({
  tags,
  onTagsChange,
  content,
  title,
  disabled = false,
}: TagManagerProps) {
  const [newTag, setNewTag] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (tags.length >= 5) {
        toast.error('Maximum 5 tags allowed');
        return;
      }
      onTagsChange([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleExtractTags = async () => {
    if (!content.trim()) {
      toast.error('Please add some content before extracting tags');
      return;
    }

    setIsExtracting(true);
    try {
      const fullContent = title ? `${title}\n\n${content}` : content;
      const result = await extractTags({
        content: fullContent,
        maxTags: 8,
        includeTitle: true,
      });

      if (result.success) {
        const data = result.data as { tags: string[] };
        setSuggestedTags(data.tags);
        setShowSuggestions(true);
        toast.success('Tags extracted successfully!');
      } else {
        toast.error(result.error || 'Failed to extract tags');
      }
    } catch (error) {
      console.error('Extract tags error:', error);
      toast.error('Failed to extract tags. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      if (tags.length >= 5) {
        toast.error('Maximum 5 tags allowed');
        return;
      }
      onTagsChange([...tags, tag]);
    }
  };

  const handleAddAllSuggestedTags = () => {
    const newTags = suggestedTags.filter(tag => !tags.includes(tag));
    const availableSlots = 5 - tags.length;
    const tagsToAdd = newTags.slice(0, availableSlots);

    if (newTags.length > availableSlots) {
      toast.success(
        `Added ${tagsToAdd.length} tags (${
          newTags.length - availableSlots
        } more available but limit reached)`
      );
    }

    onTagsChange([...tags, ...tagsToAdd]);
    setShowSuggestions(false);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-medium text-base-content'>Tags</h3>
          <span className='text-xs text-base-content/60'>{tags.length}/5</span>
        </div>
        <button
          type='button'
          onClick={handleExtractTags}
          disabled={disabled || isExtracting || !content.trim()}
          className='btn btn-xs btn-ghost gap-2'
        >
          <Sparkles className='w-3 h-3' />
          {isExtracting ? 'Extracting...' : 'Extract Tags'}
        </button>
      </div>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {tags.map(tag => (
            <span
              key={tag}
              className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md'
            >
              <Tag className='w-3 h-3' />
              {tag}
              <button
                type='button'
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                className='hover:text-primary-focus'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add New Tag */}
      <div className='flex gap-2'>
        <input
          type='text'
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Add a tag...'
          disabled={disabled}
          className='input input-sm input-bordered flex-1'
          maxLength={30}
        />
        <button
          type='button'
          onClick={handleAddTag}
          disabled={disabled || !newTag.trim() || tags.length >= 5}
          className='btn btn-sm btn-primary'
        >
          Add
        </button>
      </div>

      {/* Suggested Tags */}
      {showSuggestions && suggestedTags.length > 0 && (
        <div className='border border-base-300 rounded-lg p-4 bg-base-200'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-medium'>Suggested Tags</h4>
            <button
              type='button'
              onClick={() => setShowSuggestions(false)}
              className='btn btn-xs btn-ghost'
            >
              <X className='w-3 h-3' />
            </button>
          </div>

          <div className='flex flex-wrap gap-2 mb-3'>
            {suggestedTags.map(tag => (
              <button
                key={tag}
                type='button'
                onClick={() => handleAddSuggestedTag(tag)}
                disabled={disabled || tags.includes(tag)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                  tags.includes(tag)
                    ? 'bg-success/20 text-success cursor-not-allowed'
                    : 'bg-base-100 hover:bg-base-300 border border-base-300'
                }`}
              >
                <Tag className='w-3 h-3' />
                {tag}
              </button>
            ))}
          </div>

          <button
            type='button'
            onClick={handleAddAllSuggestedTags}
            disabled={disabled}
            className='btn btn-xs btn-primary'
          >
            Add All Suggested
          </button>
        </div>
      )}

      {tags.length === 0 && !showSuggestions && (
        <p className='text-xs text-base-content/60'>
          Add tags to help readers discover your content. Use the &quot;Extract
          Tags&quot; button to automatically generate relevant tags from your
          content.
        </p>
      )}
    </div>
  );
}
