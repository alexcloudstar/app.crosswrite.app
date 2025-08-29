'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Eye, Send, Settings, X } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { AiSuggestionsPanel } from '@/components/editor/AiSuggestionsPanel';
import { PreviewModal } from '@/components/editor/PreviewModal';
import { ThumbnailGeneratorModal } from '@/components/editor/ThumbnailGeneratorModal';
import { TagManager } from '@/components/editor/TagManager';
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
import { createDraft, getDraft, updateDraft } from '@/app/actions/drafts';
import { listIntegrations } from '@/app/actions/integrations';
import { getUserSettings } from '@/app/actions/user-settings';

import { supportedPlatforms } from '@/lib/config/platforms';
import { Draft } from '@/lib/types/drafts';
import { Integration, PublishResult } from '@/lib/types/integrations';
import { Suggestion } from '@/lib/types/ai';

type LoadingType = 'ai' | 'suggestions' | 'thumbnail' | 'saving' | null;

export default function EditorPage() {
  const router = useRouter();
  const { userPlan } = useAppStore();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled Draft');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showRewriteSettings, setShowRewriteSettings] = useState(false);
  const [showThumbnailGenerator, setShowThumbnailGenerator] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<LoadingType>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    ...supportedPlatforms,
  ]);
  const [publishing, setPublishing] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [selectedTone, setSelectedTone] = useState<
    'professional' | 'casual' | 'friendly' | 'academic'
  >('professional');
  const [selectedLength, setSelectedLength] = useState<
    'keep' | 'shorter' | 'longer'
  >('keep');
  const [contentHistory, setContentHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [tags, setTags] = useState<string[]>([]);

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  const isLoading = loadingType !== null || isLoadingDraft;

  useEffect(() => {
    async function loadUserTone() {
      try {
        const result = await getUserSettings();
        if (result.success && result.data) {
          const settings = (
            result.data as { settings: { preferredTone: string } }
          ).settings;
          if (settings?.preferredTone) {
            setSelectedTone(
              settings.preferredTone as
                | 'professional'
                | 'casual'
                | 'friendly'
                | 'academic'
            );
          }
        }
      } catch (error) {
        console.error('Failed to load user tone preference:', error);
      }
    }

    loadUserTone();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);

  const handleToggleRewriteSettings = () =>
    setShowRewriteSettings(!showRewriteSettings);

  const handleTogglePreview = () => setShowPreview(prev => !prev);

  const handleToggleThumbnailGenerator = () =>
    setShowThumbnailGenerator(prev => !prev);

  const onChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    addToHistory(newContent);
  };

  const addToHistory = useCallback(
    (newContent: string) => {
      setContentHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);

        if (newHistory.length > 50) {
          newHistory.shift();
        }
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(contentHistory[newIndex]);
    }
  }, [historyIndex, contentHistory]);

  const redo = useCallback(() => {
    if (historyIndex < contentHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(contentHistory[newIndex]);
    }
  }, [historyIndex, contentHistory]);

  const formatText = useCallback(
    (format: string) => {
      const textarea = document.querySelector(
        'textarea'
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      if (selectedText.length === 0) {
        const before = content.substring(0, start);
        const after = content.substring(end);

        let newText = '';
        switch (format) {
          case 'bold':
            newText = before + '**bold text**' + after;
            break;
          case 'italic':
            newText = before + '*italic text*' + after;
            break;
          case 'code':
            newText = before + '`code`' + after;
            break;
          case 'quote':
            newText = before + '> quoted text' + after;
            break;
          case 'bullet-list':
            newText = before + '- list item' + after;
            break;
          case 'numbered-list':
            newText = before + '1. list item' + after;
            break;
        }

        setContent(newText);
        addToHistory(newText);

        setTimeout(() => {
          textarea.focus();
          const newPosition =
            start + newText.length - before.length - after.length;
          textarea.setSelectionRange(newPosition - 8, newPosition - 1);
        }, 0);
      } else {
        const before = content.substring(0, start);
        const after = content.substring(end);

        let newText = '';
        switch (format) {
          case 'bold':
            newText = before + `**${selectedText}**` + after;
            break;
          case 'italic':
            newText = before + `*${selectedText}*` + after;
            break;
          case 'code':
            newText = before + `\`${selectedText}\`` + after;
            break;
          case 'quote':
            const quotedLines = selectedText
              .split('\n')
              .map(line => `> ${line}`)
              .join('\n');
            newText = before + quotedLines + after;
            break;
          case 'bullet-list':
            const bulletLines = selectedText
              .split('\n')
              .map(line => `- ${line}`)
              .join('\n');
            newText = before + bulletLines + after;
            break;
          case 'numbered-list':
            const numberedLines = selectedText
              .split('\n')
              .map((line, index) => `${index + 1}. ${line}`)
              .join('\n');
            newText = before + numberedLines + after;
            break;
        }

        setContent(newText);
        addToHistory(newText);

        setTimeout(() => {
          textarea.focus();
          const formattedLength = newText.length - before.length - after.length;
          textarea.setSelectionRange(start, start + formattedLength);
        }, 0);
      }
    },
    [content, addToHistory]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const textarea = document.querySelector('textarea');
      if (document.activeElement !== textarea) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'b':
            e.preventDefault();
            formatText('bold');
            break;
          case 'i':
            e.preventDefault();
            formatText('italic');
            break;
          case '`':
            e.preventDefault();
            formatText('code');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formatText, undo, redo]);

  const handleRewrite = async () => {
    if (!content.trim() || isLoading) return;

    setLoadingType('ai');
    try {
      const goals = [];
      if (selectedLength !== 'keep') {
        goals.push(
          selectedLength === 'shorter' ? 'Make it shorter' : 'Make it longer'
        );
      }

      const result = await improveText({ text: content, goals });
      if (result.success && result.data) {
        const improvedText = (result.data as { improvedText: string })
          .improvedText;
        setContent(improvedText);
        addToHistory(improvedText);
      } else {
        console.error('Rewrite failed:', result.error);
        toast.error('Failed to rewrite content. Please try again.');
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
      const result = await adjustTone({ text: content, tone: selectedTone });
      if (result.success && result.data) {
        const adjustedText = (result.data as { adjustedText: string })
          .adjustedText;
        setContent(adjustedText);
        addToHistory(adjustedText);
        toast.success(`Content adjusted to ${selectedTone} tone`);
      } else {
        console.error('Tone adjustment failed:', result.error);
        toast.error('Failed to adjust tone. Please try again.');
      }
    } catch (error) {
      console.error('Tone adjustment error:', error);
    } finally {
      setLoadingType(null);
    }
  };

  const handleApplyRewriteSettings = async () => {
    if (isLoading) return;

    if (!content.trim()) {
      toast.success('Settings saved for when you add content');
      setShowRewriteSettings(false);
      return;
    }

    setLoadingType('ai');
    try {
      let result;

      if (selectedTone !== 'professional') {
        result = await adjustTone({ text: content, tone: selectedTone });
        if (result.success && result.data) {
          const adjustedText = (result.data as { adjustedText: string })
            .adjustedText;
          setContent(adjustedText);
          addToHistory(adjustedText);
        } else {
          console.error('Tone adjustment failed:', result.error);
          toast.error('Failed to adjust tone. Please try again.');
          return;
        }
      }

      if (selectedLength !== 'keep') {
        const lengthInstruction =
          selectedLength === 'shorter' ? 'Make it shorter' : 'Make it longer';
        result = await improveText({
          text: content,
          goals: [lengthInstruction],
        });
        if (result.success && result.data) {
          const improvedText = (result.data as { improvedText: string })
            .improvedText;
          setContent(improvedText);
          addToHistory(improvedText);
        } else {
          console.error('Length adjustment failed:', result.error);
          toast.error('Failed to adjust length. Please try again.');
          return;
        }
      }

      toast.success('Content adjusted successfully');
      setShowRewriteSettings(false);
    } catch (error) {
      console.error('Rewrite settings error:', error);
      toast.error('Failed to apply settings. Please try again.');
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
        const summary = (result.data as { summary: string }).summary;
        setContent(summary);
        addToHistory(summary);
      } else {
        console.error('Summarize failed:', result.error);
        toast.error('Failed to summarize content. Please try again.');
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
        const suggestionsData = (
          result.data as {
            suggestions: Suggestion[];
          }
        ).suggestions;
        setSuggestions(suggestionsData);
      } else {
        console.error('Generate suggestions failed:', result.error);
        toast.error('Failed to generate suggestions. Please try again.');
      }
    } catch (error) {
      console.error('Generate suggestions error:', error);
    } finally {
      setLoadingType(null);
    }
  };

  const handleApplySuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      const timestamp = new Date().toLocaleTimeString();
      const suggestionNote = `\n\n---\n**AI Suggestion (${timestamp}):** ${suggestion.suggestion}\n\n*Note: This suggestion has been applied. You can edit or remove this note as needed.*`;
      const newContent = content + suggestionNote;
      setContent(newContent);
      addToHistory(newContent);

      setSuggestions(prev =>
        prev.map(s => (s.id === suggestionId ? { ...s, applied: true } : s))
      );
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim() || isLoading) return;

    setLoadingType('saving');
    try {
      let result;

      if (draftId) {
        result = await updateDraft({
          id: draftId,
          title: title.trim(),
          content: content.trim(),
          contentPreview:
            content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          thumbnailUrl: thumbnailUrl || undefined,
          tags: tags,
        });
      } else {
        result = await createDraft({
          title: title.trim(),
          content: content.trim(),
          contentPreview:
            content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          thumbnailUrl: thumbnailUrl || undefined,
          tags: tags,
        });
      }

      if (result.success) {
        toast.success('Draft saved successfully!');
        window.location.href = '/drafts';
      } else {
        toast.error(`Failed to save draft: ${result.error}`);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setLoadingType(null);
    }
  };

  const handlePublish = () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform to publish to.');
      return;
    }
    setShowPublishModal(true);
  };

  const handlePublishSubmit = async () => {
    if (!title.trim() || !content.trim() || publishing) return;

    setPublishing(true);
    try {
      let currentDraftId = draftId;

      if (!currentDraftId) {
        const draftResult = await createDraft({
          title: title.trim(),
          content: content.trim(),
          contentPreview:
            content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          thumbnailUrl: thumbnailUrl || undefined,
          tags: tags,
        });

        if (!draftResult.success) {
          console.error('Failed to save draft:', draftResult.error);
          toast.error('Failed to save draft before publishing.');
          return;
        }

        currentDraftId = (draftResult.data as Draft).id;
      } else {
        const updateResult = await updateDraft({
          id: currentDraftId,
          title: title.trim(),
          content: content.trim(),
          contentPreview:
            content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          thumbnailUrl: thumbnailUrl || undefined,
          tags: tags,
        });

        if (!updateResult.success) {
          console.error('Failed to update draft:', updateResult.error);
          toast.error('Failed to update draft before publishing.');
          return;
        }
      }

      const result = await publishToPlatforms({
        draftId: currentDraftId,
        platforms: selectedPlatforms,
        options: {
          publishAsDraft: false,
        },
      });

      if (result.success) {
        console.log('Published successfully:', result.data);
        const publishData = result.data as PublishResult;
        console.log('Publish summary:', publishData.summary);
        console.log('Publish results:', publishData.results);
        setShowPublishModal(false);

        toast.success(
          `Successfully published to ${
            (result.data as PublishResult).summary.successful
          } platforms! Redirecting to drafts...`
        );

        // Use router.push for better state management
        setTimeout(() => {
          router.push('/drafts');
        }, 1000);
      } else {
        console.error('Publish failed:', result.error);
        toast.error(`Publish failed: ${result.error}`);
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
      setDraftId(id);
      setIsLoadingDraft(true);

      async function loadDraft() {
        try {
          const result = await getDraft({ id });
          if (result.success && result.data) {
            const draft = result.data as Draft;
            setTitle(draft.title);
            setContent(draft.content);
            setThumbnailUrl(draft.thumbnailUrl || null);
            setTags(draft.tags || []);
          } else {
            toast.error('Failed to load draft');
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
          toast.error('Failed to load draft');
        } finally {
          setIsLoadingDraft(false);
        }
      }

      loadDraft();
    }
  }, []);

  useEffect(() => {
    if (!showPublishModal) return;

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
      case 'saving':
        return {
          title: 'Saving draft...',
          subtitle: 'Please wait while we save your content',
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
        onFormatText={formatText}
        isAiLoading={isLoading}
        hasContent={!!content.trim()}
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
                disabled={isLoading || !content.trim()}
                title={
                  !content.trim() ? 'Add some content to save' : 'Save draft'
                }
              >
                <Save size={16} className='mr-2' />
                {loadingType === 'saving' ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublish}
                className='btn btn-primary btn-sm'
                disabled={isLoading || !content.trim()}
                title={
                  !content.trim()
                    ? 'Add some content to publish'
                    : 'Publish to platforms'
                }
              >
                <Send size={16} className='mr-2' />
                Publish
              </button>
            </div>
          </div>
        </div>

        <div className='w-80 border-l border-base-300 bg-base-200 flex-shrink-0 flex flex-col'>
          <div className='flex-1 overflow-y-auto'>
            <AiSuggestionsPanel
              content={content}
              suggestions={suggestions}
              onGenerateSuggestions={handleGenerateSuggestions}
              isGenerating={loadingType === 'suggestions'}
              onApplySuggestion={handleApplySuggestion}
            />
          </div>

          <div className='border-t border-base-300 p-4'>
            <TagManager
              tags={tags}
              onTagsChange={setTags}
              content={content}
              title={title}
              disabled={isLoading}
            />
          </div>
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
                <select
                  className='select select-bordered w-full'
                  value={selectedTone}
                  onChange={e =>
                    setSelectedTone(
                      e.target.value as
                        | 'professional'
                        | 'casual'
                        | 'friendly'
                        | 'academic'
                    )
                  }
                >
                  <option value='professional'>Professional</option>
                  <option value='casual'>Casual</option>
                  <option value='friendly'>Friendly</option>
                  <option value='academic'>Academic</option>
                </select>
              </div>
              <div>
                <label className='label'>
                  <span className='label-text'>Length</span>
                </label>
                <select
                  className='select select-bordered w-full'
                  value={selectedLength}
                  onChange={e =>
                    setSelectedLength(
                      e.target.value as 'keep' | 'shorter' | 'longer'
                    )
                  }
                >
                  <option value='keep'>Keep current length</option>
                  <option value='shorter'>Make it shorter</option>
                  <option value='longer'>Make it longer</option>
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
                onClick={handleApplyRewriteSettings}
                title='Apply settings to content'
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
                onClick={setShowPublishModal.bind(null, false)}
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
                  {supportedPlatforms.map(platform => {
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
                onClick={setShowPublishModal.bind(null, false)}
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
