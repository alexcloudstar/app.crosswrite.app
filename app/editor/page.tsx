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
import {
  improveText,
  adjustTone,
  summarizeText,
  generateSuggestions,
} from '@/app/actions/ai';

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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

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

  const handleRewrite = async () => {
    if (!content.trim() || isAiLoading) return;

    setIsAiLoading(true);
    try {
      const result = await improveText({ text: content });
      if (result.success && result.data) {
        setContent((result.data as { improvedText: string }).improvedText);
      } else {
        console.error('Rewrite failed:', result.error);
        // TODO: Add toast notification
      }
    } catch (error) {
      console.error('Rewrite error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTone = async () => {
    if (!content.trim() || isAiLoading) return;

    setIsAiLoading(true);
    try {
      const result = await adjustTone({ text: content, tone: 'professional' });
      if (result.success && result.data) {
        setContent((result.data as { adjustedText: string }).adjustedText);
      } else {
        console.error('Tone adjustment failed:', result.error);
        // TODO: Add toast notification
      }
    } catch (error) {
      console.error('Tone adjustment error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!content.trim() || isAiLoading) return;

    setIsAiLoading(true);
    try {
      const result = await summarizeText({ text: content, style: 'paragraph' });
      if (result.success && result.data) {
        setContent((result.data as { summary: string }).summary);
      } else {
        console.error('Summarize failed:', result.error);
        // TODO: Add toast notification
      }
    } catch (error) {
      console.error('Summarize error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!content.trim() || isGeneratingSuggestions) return;

    setIsGeneratingSuggestions(true);
    try {
      const result = await generateSuggestions({ content, maxSuggestions: 4 });
      if (result.success && result.data) {
        console.log(
          'Generated suggestions:',
          (
            result.data as {
              suggestions: Array<{
                id: string;
                type: string;
                title: string;
                description: string;
                suggestion: string;
                applied: boolean;
              }>;
            }
          ).suggestions
        );
        // TODO: Update the suggestions in the AiSuggestionsPanel
        // For now, just log them
      } else {
        console.error('Generate suggestions failed:', result.error);
        // TODO: Add toast notification
      }
    } catch (error) {
      console.error('Generate suggestions error:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    // Add the suggestion as a note at the end of the content
    const timestamp = new Date().toLocaleTimeString();
    const suggestionNote = `\n\n---\n**AI Suggestion (${timestamp}):** ${suggestion}\n\n*Note: This suggestion has been applied. You can edit or remove this note as needed.*`;
    setContent(prev => prev + suggestionNote);
  };

  return (
    <div
      className={`h-full flex flex-col relative ${
        isAiLoading || isGeneratingThumbnail ? 'cursor-wait' : ''
      }`}
    >
      {isAiLoading && (
        <div className='absolute inset-0 bg-base-300/50 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='loading loading-spinner loading-lg text-primary'></div>
            <p className='text-lg font-medium'>
              AI is processing your content...
            </p>
            <p className='text-sm text-base-content/70'>
              Please wait while we improve your text
            </p>
          </div>
        </div>
      )}

      {(isAiLoading || isGeneratingThumbnail) && (
        <div className='absolute inset-0 bg-base-300/50 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='loading loading-spinner loading-lg text-primary'></div>
            <p className='text-lg font-medium'>
              {isGeneratingThumbnail
                ? 'Generating thumbnail...'
                : 'AI is processing your content...'}
            </p>
            <p className='text-sm text-base-content/70'>
              {isGeneratingThumbnail
                ? 'Please wait while we create your thumbnail'
                : 'Please wait while we improve your text'}
            </p>
          </div>
        </div>
      )}
      <div className='flex items-center justify-between p-4 border-b border-base-300 bg-base-100'>
        <div className='flex items-center space-x-4 flex-1'>
          <input
            type='text'
            value={title}
            onChange={handleTitleChange}
            disabled={isAiLoading || isGeneratingThumbnail}
            className={`text-xl font-semibold bg-transparent border-none outline-none flex-1 ${
              isAiLoading || isGeneratingThumbnail
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
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
            disabled={isAiLoading || isGeneratingThumbnail}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleTogglePreview}
            className='btn btn-ghost btn-sm'
            title='Preview'
            disabled={isAiLoading || isGeneratingThumbnail}
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <EditorToolbar
        onGenerateThumbnail={handleToggleThumbnailGenerator}
        onRewrite={handleRewrite}
        onTone={handleTone}
        onSummarize={handleSummarize}
        isAiLoading={isAiLoading || isGeneratingThumbnail}
      />

      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 flex flex-col min-h-0'>
          <div className='flex-1 overflow-y-auto'>
            <MarkdownEditor
              value={content}
              onChangeContent={onChangeContent}
              placeholder='Start writing your content...'
              disabled={isAiLoading || isGeneratingThumbnail}
            />
          </div>

          <div className='flex items-center justify-between p-4 border-t border-base-300 bg-base-100 flex-shrink-0'>
            <div className='flex items-center space-x-4 text-sm text-base-content/50'>
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                className='btn btn-ghost btn-sm'
                disabled={isAiLoading || isGeneratingThumbnail}
              >
                <Save size={16} className='mr-2' />
                Save Draft
              </button>
              <button
                className='btn btn-primary btn-sm'
                disabled={isAiLoading || isGeneratingThumbnail}
              >
                <Send size={16} className='mr-2' />
                Publish
              </button>
            </div>
          </div>
        </div>

        <div className='w-80 border-l border-base-300 bg-base-200 flex-shrink-0'>
          <AiSuggestionsPanel
            content={content}
            onGenerateSuggestions={handleGenerateSuggestions}
            isGenerating={isGeneratingSuggestions}
            onApplySuggestion={handleApplySuggestion}
          />
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
          onGeneratingChange={setIsGeneratingThumbnail}
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
