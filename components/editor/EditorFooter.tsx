'use client';

import { Save, Send } from 'lucide-react';

type EditorFooterProps = {
  wordCount: number;
  readingTime: number;
  isLoading: boolean;
  loadingType: 'ai' | 'suggestions' | 'thumbnail' | 'saving' | null;
  content: string;
  draftStatus: 'draft' | 'published';
  onSaveDraft: () => void;
  onPublish: () => void;
};

export const EditorFooter = ({
  wordCount,
  readingTime,
  isLoading,
  loadingType,
  content,
  draftStatus,
  onSaveDraft,
  onPublish,
}: EditorFooterProps) => {
  return (
    <div className='flex items-center justify-between p-4 border-t border-base-300 bg-base-100 flex-shrink-0'>
      <div className='flex items-center space-x-4 text-sm text-base-content/50'>
        <span>{wordCount} words</span>
        <span>{readingTime} min read</span>
      </div>
      <div className='flex items-center space-x-2'>
        <button
          onClick={onSaveDraft}
          className='btn btn-ghost btn-sm'
          disabled={isLoading || !content.trim()}
          title={!content.trim() ? 'Add some content to save' : 'Save draft'}
        >
          <Save size={16} className='mr-2' />
          {loadingType === 'saving' ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={onPublish}
          className={`btn btn-primary btn-sm ${draftStatus === 'published' ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={isLoading || !content.trim() || draftStatus === 'published'}
          title={
            !content.trim()
              ? 'Add some content to publish'
              : draftStatus === 'published'
                ? 'This draft has already been published'
                : 'Publish to platforms'
          }
        >
          <Send size={16} className='mr-2' />
          {draftStatus === 'published' ? 'Published' : 'Publish'}
        </button>
      </div>
    </div>
  );
};
