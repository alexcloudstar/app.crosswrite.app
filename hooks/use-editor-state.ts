'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getUserSettings } from '@/app/actions/user-settings';
import { getDraft } from '@/app/actions/drafts';
import { Draft } from '@/lib/types/drafts';

type LoadingType = 'ai' | 'suggestions' | 'thumbnail' | 'saving' | null;

export const useEditorState = () => {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<'draft' | 'published'>(
    'draft'
  );
  const [title, setTitle] = useState('Untitled Draft');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showRewriteSettings, setShowRewriteSettings] = useState(false);
  const [showThumbnailGenerator, setShowThumbnailGenerator] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<LoadingType>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
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

  // Load user tone preference
  useEffect(() => {
    const loadUserTone = async () => {
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
      } catch {
        toast.error('Failed to load user tone preference');
      }
    };

    loadUserTone();
  }, []);

  // Load draft from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
      setDraftId(id);
      setIsLoadingDraft(true);

      const loadDraft = async () => {
        try {
          const result = await getDraft({ id });
          if (result.success && result.data) {
            const draft = result.data as Draft;
            setTitle(draft.title);
            setContent(draft.content);
            setDraftStatus(draft.status);
            setThumbnailUrl(draft.thumbnailUrl || null);
            setTags(draft.tags || []);
          } else {
            toast.error('Failed to load draft');
          }
        } catch {
          toast.error('Failed to load draft');
        } finally {
          setIsLoadingDraft(false);
        }
      };

      loadDraft();
    }
  }, []);

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

  return {
    // State
    draftId,
    setDraftId,
    draftStatus,
    setDraftStatus,
    title,
    setTitle,
    content,
    setContent,
    showPreview,
    setShowPreview,
    showRewriteSettings,
    setShowRewriteSettings,
    showThumbnailGenerator,
    setShowThumbnailGenerator,
    thumbnailUrl,
    setThumbnailUrl,
    loadingType,
    setLoadingType,
    showPublishModal,
    setShowPublishModal,
    publishing,
    setPublishing,
    connectedPlatforms,
    setConnectedPlatforms,
    isLoadingDraft,
    selectedTone,
    setSelectedTone,
    selectedLength,
    setSelectedLength,
    contentHistory,
    historyIndex,
    tags,
    setTags,

    // Computed values
    wordCount,
    readingTime,
    isLoading,

    // History functions
    addToHistory,
    undo,
    redo,
  };
};
