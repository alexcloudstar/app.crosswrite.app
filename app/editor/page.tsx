'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, Send, Settings, X } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { AiSuggestionsPanel } from '@/components/editor/AiSuggestionsPanel';
import { PreviewModal } from '@/components/editor/PreviewModal';
import { ThumbnailGeneratorModal } from '@/components/editor/ThumbnailGeneratorModal';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { QuotaHint } from '@/components/ui/QuotaHint';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { useAppStore } from '@/lib/store';
import {
  improveText,
  adjustTone,
  summarizeText,
  generateSuggestions,
} from '@/app/actions/ai';
import { publishToPlatforms } from '@/app/actions/integrations/publish';
import { createDraft } from '@/app/actions/drafts';
import { listIntegrations } from '@/app/actions/integrations';

interface Draft {
  id: string;
  title: string;
  content: string;
  contentPreview?: string;
  status: string;
  platforms: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
}

interface PublishResult {
  results: Array<{
    platform: string;
    success: boolean;
    platformPostId?: string;
    platformUrl?: string;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    draftId: string;
  };
}

interface Integration {
  id: string;
  platform: string;
  status: string;
  connectedAt?: Date;
  lastSync?: Date;
}

type LoadingType = 'ai' | 'suggestions' | 'thumbnail' | null;

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
  const [loadingType, setLoadingType] = useState<LoadingType>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'devto',
    'hashnode',
  ]);
  const [publishing, setPublishing] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  const isLoading = loadingType !== null;

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
    if (!content.trim() || isLoading) return;

    setLoadingType('ai');
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
      setLoadingType(null);
    }
  };

  const handleTone = async () => {
    if (!content.trim() || isLoading) return;

    setLoadingType('ai');
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
      setLoadingType(null);
    }
  };

  const handleSummarize = async () => {
    if (!content.trim() || isLoading) return;

    setLoadingType('ai');
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
      setLoadingType(null);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!content.trim() || isLoading) return;

    setLoadingType('suggestions');
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
      setLoadingType(null);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    // Add the suggestion as a note at the end of the content
    const timestamp = new Date().toLocaleTimeString();
    const suggestionNote = `\n\n---\n**AI Suggestion (${timestamp}):** ${suggestion}\n\n*Note: This suggestion has been applied. You can edit or remove this note as needed.*`;
    setContent(prev => prev + suggestionNote);
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim() || isLoading) return;

    setLoadingType('ai'); // Reuse loading state for save
    try {
      const result = await createDraft({
        title: title.trim(),
        content: content.trim(),
        contentPreview:
          content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        thumbnailUrl: thumbnailUrl || undefined,
        tags: [], // TODO: Add tag extraction from content
      });

      if (result.success) {
        alert('Draft saved successfully!');
        // Optionally redirect to drafts page or stay in editor
        window.location.href = '/drafts';
      } else {
        alert(`Failed to save draft: ${result.error}`);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setLoadingType(null);
    }
  };

  const handlePublish = () => {
    // Check if user has any platforms selected
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform to publish to.');
      return;
    }
    setShowPublishModal(true);
  };

  const handlePublishSubmit = async () => {
    if (!title.trim() || !content.trim() || publishing) return;

    setPublishing(true);
    try {
      // First save the draft
      const draftResult = await createDraft({
        title: title.trim(),
        content: content.trim(),
        contentPreview:
          content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        thumbnailUrl: thumbnailUrl || undefined,
        tags: [], // TODO: Add tag extraction from content
      });

      if (!draftResult.success) {
        console.error('Failed to save draft:', draftResult.error);
        // TODO: Show error message
        return;
      }

      const draftId = (draftResult.data as Draft).id;

      // Then publish to platforms
      const result = await publishToPlatforms({
        draftId,
        platforms: selectedPlatforms,
        options: {
          publishAsDraft: false,
        },
      });

      if (result.success) {
        console.log('Published successfully:', result.data);
        setShowPublishModal(false);
        // Show success message
        alert(
          `Successfully published to ${
            (result.data as PublishResult).summary.successful
          } platforms! Redirecting to drafts...`
        );
        // window.location.href = '/drafts';
      } else {
        console.error('Publish failed:', result.error);
        alert(`Publish failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setPublishing(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Load connected integrations when publish modal opens
  useEffect(() => {
    if (showPublishModal) {
      async function loadIntegrations() {
        try {
          const result = await listIntegrations();
          if (result.success && result.data) {
            const connected = (result.data as Integration[])
              .filter(
                (integration: Integration) => integration.status === 'connected'
              )
              .map((integration: Integration) => integration.platform);
            setConnectedPlatforms(connected);
          }
        } catch (error) {
          console.error('Failed to load integrations:', error);
        }
      }
      loadIntegrations();
    }
  }, [showPublishModal]);

  const getLoadingMessage = () => {
    switch (loadingType) {
      case 'ai':
        return {
          title: 'AI is processing your content...',
          subtitle: 'Please wait while we improve your text',
        };
      case 'suggestions':
        return {
          title: 'Generating suggestions...',
          subtitle: 'Please wait while we analyze your content',
        };
      case 'thumbnail':
        return {
          title: 'Generating thumbnail...',
          subtitle: 'Please wait while we create your thumbnail',
        };
      default:
        return {
          title: 'Processing...',
          subtitle: 'Please wait',
        };
    }
  };

  const loadingMessage = getLoadingMessage();

  return (
    <div
      className={`h-full flex flex-col relative ${
        isLoading ? 'cursor-wait' : ''
      }`}
    >
      {isLoading && (
        <div className='absolute inset-0 bg-base-300/50 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='loading loading-spinner loading-lg text-primary'></div>
            <p className='text-lg font-medium'>{loadingMessage.title}</p>
            <p className='text-sm text-base-content/70'>
              {loadingMessage.subtitle}
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
            disabled={isLoading}
            className={`text-xl font-semibold bg-transparent border-none outline-none flex-1 ${
              isLoading ? 'cursor-not-allowed opacity-50' : ''
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
            disabled={isLoading}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleTogglePreview}
            className='btn btn-ghost btn-sm'
            title='Preview'
            disabled={isLoading}
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
        isAiLoading={isLoading}
      />

      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 flex flex-col min-h-0'>
          <div className='flex-1 overflow-y-auto'>
            <MarkdownEditor
              value={content}
              onChangeContent={onChangeContent}
              placeholder='Start writing your content...'
              disabled={isLoading}
            />
          </div>

          <div className='flex items-center justify-between p-4 border-t border-base-300 bg-base-100 flex-shrink-0'>
            <div className='flex items-center space-x-4 text-sm text-base-content/50'>
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={handleSaveDraft}
                className='btn btn-ghost btn-sm'
                disabled={isLoading}
              >
                <Save size={16} className='mr-2' />
                {isLoading ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublish}
                className='btn btn-primary btn-sm'
                disabled={isLoading}
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
            isGenerating={loadingType === 'suggestions'}
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
          onGeneratingChange={isGenerating =>
            setLoadingType(isGenerating ? 'thumbnail' : null)
          }
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

      {showPublishModal && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-lg flex items-center'>
                <Send size={20} className='mr-2' />
                Publish to Platforms
              </h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className='btn btn-ghost btn-sm btn-circle'
              >
                <X size={16} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='label'>
                  <span className='label-text'>Select Platforms</span>
                </label>
                <div className='space-y-2'>
                  {['devto', 'hashnode'].map(platform => {
                    const isConnected = connectedPlatforms.includes(platform);
                    return (
                      <CustomCheckbox
                        key={platform}
                        checked={selectedPlatforms.includes(platform)}
                        onChange={handlePlatformToggle.bind(null, platform)}
                        disabled={!isConnected}
                      >
                        <span
                          className={`capitalize ${
                            !isConnected ? 'opacity-50' : ''
                          }`}
                        >
                          {platform}
                          {!isConnected && ' (Not Connected)'}
                        </span>
                      </CustomCheckbox>
                    );
                  })}
                </div>
              </div>

              <div className='text-sm text-base-content/70'>
                <p>Your article will be published to the selected platforms.</p>
                <p className='mt-1'>
                  Make sure you have connected these platforms in the{' '}
                  <Link href='/integrations' className='link link-primary'>
                    Integrations page
                  </Link>{' '}
                  first.
                </p>
                {selectedPlatforms.length === 0 && (
                  <div className='alert alert-warning mt-4'>
                    <div>
                      <span className='font-medium'>
                        No platforms selected!
                      </span>
                      <p className='text-xs mt-1'>
                        Please select at least one platform to publish to.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='modal-action'>
              <button
                onClick={() => setShowPublishModal(false)}
                className='btn btn-ghost'
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                onClick={handlePublishSubmit}
                className='btn btn-primary'
                disabled={publishing || selectedPlatforms.length === 0}
              >
                <Send size={16} className='mr-2' />
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
