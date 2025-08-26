'use client';

import { useState } from 'react';
import { Save, Eye, Send, Settings } from 'lucide-react';
import NextImage from 'next/image';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { AiSuggestionsPanel } from '@/components/editor/AiSuggestionsPanel';
import { PreviewModal } from '@/components/editor/PreviewModal';
import { ThumbnailGeneratorModal } from '@/components/editor/ThumbnailGeneratorModal';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { QuotaHint } from '@/components/ui/QuotaHint';
import { useAppStore } from '@/lib/store';

export default function EditorPage() {
  const { userPlan } = useAppStore();
  const [title, setTitle] = useState('Untitled Draft');
  const [content, setContent] = useState(`# Getting Started with Cross Write

Welcome to Cross Write, your multi-platform writing and publishing companion. This editor is designed to help you create content that can be published across multiple platforms with ease.

## Key Features

- **AI-Assisted Writing**: Get suggestions and improvements as you write
- **Multi-Platform Publishing**: Write once, publish everywhere
- **Smart Formatting**: Automatic formatting for different platforms
- **Real-time Preview**: See how your content will look before publishing

## Getting Started

1. Start by writing your content in the editor
2. Use the AI suggestions panel for improvements
3. Preview your content using the preview button
4. Save your draft or publish directly to your connected platforms

## Tips for Better Content

- Use clear headings and subheadings
- Keep paragraphs short and readable
- Include relevant images and examples
- Use the AI suggestions to improve your writing

Happy writing! 🚀`);
  const [showPreview, setShowPreview] = useState(false);
  const [showRewriteSettings, setShowRewriteSettings] = useState(false);
  const [showThumbnailGenerator, setShowThumbnailGenerator] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);

  const handleToggleRewriteSettings = () =>
    setShowRewriteSettings(!showRewriteSettings);

  const handleTogglePreview = () => setShowPreview(prev => !prev);

  const handleToggleThumbnailGenerator = () =>
    setShowThumbnailGenerator(prev => !prev);

  const onChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setContent(e.target.value);

  return (
    <div className='h-full flex flex-col'>
      <div className='flex items-center justify-between p-4 border-b border-base-300 bg-base-100'>
        <div className='flex items-center space-x-4 flex-1'>
          <input
            type='text'
            value={title}
            onChange={handleTitleChange}
            className='text-xl font-semibold bg-transparent border-none outline-none flex-1'
            placeholder='Enter title...'
          />
          {thumbnailUrl && (
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-base-content/50'>Thumbnail:</span>
              <NextImage
                src={thumbnailUrl}
                alt='Selected thumbnail'
                width={32}
                height={32}
                className='w-8 h-8 object-cover rounded border border-base-300'
              />
            </div>
          )}
        </div>

        <div className='flex items-center space-x-2'>
          <div className='flex items-center space-x-2 mr-4'>
            <PlanBadge planId={userPlan.planId} />
            <QuotaHint type='articles' />
            <QuotaHint type='thumbnails' />
          </div>
          <button
            onClick={handleToggleRewriteSettings}
            className='btn btn-ghost btn-sm'
            title='AI Rewrite Settings'
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleTogglePreview}
            className='btn btn-ghost btn-sm'
            title='Preview'
          >
            <Eye size={16} />
          </button>
          <button className='btn btn-primary btn-sm'>
            <Save size={16} className='mr-2' />
            Save Draft
          </button>
          <button className='btn btn-success btn-sm'>
            <Send size={16} className='mr-2' />
            Publish
          </button>
        </div>
      </div>

      <EditorToolbar onGenerateThumbnail={handleToggleThumbnailGenerator} />

      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 flex flex-col'>
          <MarkdownEditor
            value={content}
            onChangeContent={onChangeContent}
            placeholder='Start writing your content...'
          />

          <div className='flex items-center justify-between p-4 border-t border-base-300 bg-base-100'>
            <div className='flex items-center space-x-4 text-sm text-base-content/50'>
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
            </div>
            <div className='flex items-center space-x-2'>
              <button className='btn btn-ghost btn-sm'>
                <Save size={16} className='mr-2' />
                Save Draft
              </button>
              <button className='btn btn-primary btn-sm'>
                <Send size={16} className='mr-2' />
                Publish
              </button>
            </div>
          </div>
        </div>

        <div className='w-80 border-l border-base-300 bg-base-200'>
          <AiSuggestionsPanel content={content} />
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          title={title}
          content={content}
          onClose={handleTogglePreview}
        />
      )}

      {showThumbnailGenerator && (
        <ThumbnailGeneratorModal
          isOpen={showThumbnailGenerator}
          onClose={handleToggleThumbnailGenerator}
          onSelect={setThumbnailUrl}
        />
      )}

      {showRewriteSettings && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-md'>
            <h3 className='font-bold text-lg mb-4'>AI Rewrite Settings</h3>
            <div className='space-y-4'>
              <div>
                <label className='label'>
                  <span className='label-text'>Tone</span>
                </label>
                <select className='select select-bordered w-full'>
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Friendly</option>
                  <option>Academic</option>
                </select>
              </div>
              <div>
                <label className='label'>
                  <span className='label-text'>Length</span>
                </label>
                <select className='select select-bordered w-full'>
                  <option>Keep current length</option>
                  <option>Make it shorter</option>
                  <option>Make it longer</option>
                </select>
              </div>
            </div>
            <div className='modal-action'>
              <button
                className='btn btn-ghost'
                onClick={handleToggleRewriteSettings}
              >
                Cancel
              </button>
              <button
                className='btn btn-primary'
                onClick={handleToggleRewriteSettings}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
