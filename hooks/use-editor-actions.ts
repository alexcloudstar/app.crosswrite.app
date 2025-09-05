'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  improveText,
  adjustTone,
  summarizeText,
  generateSuggestions,
} from '@/app/actions/ai';
import { publishToPlatforms } from '@/app/actions/integrations/publish';
import { createDraft, updateDraft } from '@/app/actions/drafts';
import { listIntegrations } from '@/app/actions/integrations';
import { generateContentPreview } from '@/lib/validators/common';
import { Draft } from '@/lib/types/drafts';
import { PublishResult } from '@/lib/types/integrations';
import { Suggestion } from '@/lib/types/ai';
import { supportedPlatforms } from '@/lib/config/platforms';

type EditorState = {
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  draftStatus: 'draft' | 'published';
  setDraftStatus: (status: 'draft' | 'published') => void;
  title: string;
  content: string;
  setContent: (content: string) => void;
  thumbnailUrl: string | null;
  tags: string[];
  selectedTone: 'professional' | 'casual' | 'friendly' | 'academic';
  selectedLength: 'keep' | 'shorter' | 'longer';
  loadingType: 'ai' | 'suggestions' | 'thumbnail' | 'saving' | null;
  setLoadingType: (
    type: 'ai' | 'suggestions' | 'thumbnail' | 'saving' | null
  ) => void;
  showPublishModal: boolean;
  setShowPublishModal: (show: boolean) => void;
  publishing: boolean;
  setPublishing: (publishing: boolean) => void;
  connectedPlatforms: string[];
  setConnectedPlatforms: (platforms: string[]) => void;
  addToHistory: (content: string) => void;
  isLoading: boolean;
};

export const useEditorActions = (state: EditorState) => {
  const router = useRouter();

  const handleRewrite = useCallback(async () => {
    if (!state.content.trim() || state.isLoading) return;

    state.setLoadingType('ai');
    try {
      const goals = [];
      if (state.selectedLength !== 'keep') {
        goals.push(
          state.selectedLength === 'shorter'
            ? 'Make it shorter'
            : 'Make it longer'
        );
      }

      const result = await improveText({ text: state.content, goals });
      if (result.success && result.data) {
        const improvedText = (result.data as { improvedText: string })
          .improvedText;
        state.setContent(improvedText);
        state.addToHistory(improvedText);
      }

      if (!result.success) {
        toast.error('Failed to rewrite content. Please try again.');
      }
    } catch {
      toast.error('Failed to rewrite text');
    } finally {
      state.setLoadingType(null);
    }
  }, [state]);

  const handleTone = useCallback(async () => {
    if (!state.content.trim() || state.isLoading) return;

    state.setLoadingType('ai');
    try {
      const result = await adjustTone({
        text: state.content,
        targetTone: state.selectedTone,
      });
      if (result.success && result.data) {
        const adjustedText = (result.data as { adjustedText: string })
          .adjustedText;
        state.setContent(adjustedText);
        state.addToHistory(adjustedText);
        toast.success(`Content adjusted to ${state.selectedTone} tone`);
      }
      if (!result.success) {
        toast.error('Failed to adjust tone. Please try again.');
      }
    } catch {
      toast.error('Failed to adjust tone');
    } finally {
      state.setLoadingType(null);
    }
  }, [state]);

  const handleApplyRewriteSettings = useCallback(async () => {
    if (state.isLoading) return;

    if (!state.content.trim()) {
      toast.success('Settings saved for when you add content');
      return;
    }

    state.setLoadingType('ai');
    try {
      let result;

      if (state.selectedTone !== 'professional') {
        result = await adjustTone({
          text: state.content,
          targetTone: state.selectedTone,
        });
        if (result.success && result.data) {
          const adjustedText = (result.data as { adjustedText: string })
            .adjustedText;
          state.setContent(adjustedText);
          state.addToHistory(adjustedText);
        } else {
          toast.error('Failed to adjust tone. Please try again.');
          return;
        }
      }

      if (state.selectedLength !== 'keep') {
        const lengthInstruction =
          state.selectedLength === 'shorter'
            ? 'Make it shorter'
            : 'Make it longer';
        result = await improveText({
          text: state.content,
          goals: [lengthInstruction],
        });
        if (result.success && result.data) {
          const improvedText = (result.data as { improvedText: string })
            .improvedText;
          state.setContent(improvedText);
          state.addToHistory(improvedText);
        } else {
          toast.error('Failed to adjust length. Please try again.');
          return;
        }
      }

      toast.success('Content adjusted successfully');
    } catch {
      toast.error('Failed to apply settings. Please try again.');
    } finally {
      state.setLoadingType(null);
    }
  }, [state]);

  const handleSummarize = useCallback(async () => {
    if (!state.content.trim() || state.isLoading) return;

    state.setLoadingType('ai');
    try {
      const result = await summarizeText({
        text: state.content,
        maxLength: 200,
      });
      if (result.success && result.data) {
        const summary = (result.data as { summary: string }).summary;
        state.setContent(summary);
        state.addToHistory(summary);
      } else {
        toast.error('Failed to summarize content. Please try again.');
      }
    } catch {
      toast.error('Failed to summarize content');
    } finally {
      state.setLoadingType(null);
    }
  }, [state]);

  const handleGenerateSuggestions = useCallback(async () => {
    if (!state.content.trim() || state.isLoading) return;

    state.setLoadingType('suggestions');
    try {
      const result = await generateSuggestions({
        text: state.content,
        maxSuggestions: 4,
      });
      if (result.success && result.data) {
        const suggestionsData = (
          result.data as {
            suggestions: Suggestion[];
          }
        ).suggestions;
        return suggestionsData;
      } else {
        toast.error('Failed to generate suggestions. Please try again.');
        return [];
      }
    } catch {
      toast.error('Failed to generate suggestions');
      return [];
    } finally {
      state.setLoadingType(null);
    }
  }, [state]);

  const handleSaveDraft = useCallback(async () => {
    if (!state.title.trim() || !state.content.trim() || state.isLoading) return;

    state.setLoadingType('saving');
    try {
      let result;

      if (state.draftId) {
        result = await updateDraft({
          id: state.draftId,
          title: state.title.trim(),
          content: state.content,
          thumbnailUrl: state.thumbnailUrl || undefined,
          tags: state.tags,
        });
      } else {
        result = await createDraft({
          title: state.title.trim(),
          content: state.content,
          thumbnailUrl: state.thumbnailUrl || undefined,
          tags: state.tags,
        });
      }

      if (result.success) {
        toast.success('Draft saved successfully!');
        window.location.href = '/drafts';
      }

      if (!result.success) {
        toast.error(`Failed to save draft: ${result.error}`);
      }
    } catch {
      toast.error('Failed to save draft. Please try again.');
    } finally {
      state.setLoadingType(null);
    }
  }, [state]);

  const handlePublishSubmit = useCallback(
    async (selectedPlatforms: string[]) => {
      if (
        !state.title.trim() ||
        !state.content.trim() ||
        state.publishing ||
        state.draftStatus === 'published'
      )
        return;

      state.setPublishing(true);
      try {
        let currentDraftId = state.draftId;

        if (!currentDraftId) {
          const draftResult = await createDraft({
            title: state.title.trim(),
            content: state.content.trim(),
            contentPreview: generateContentPreview(state.content, 200),
            thumbnailUrl: state.thumbnailUrl || undefined,
            tags: state.tags,
          });

          if (!draftResult.success) {
            toast.error('Failed to save draft before publishing.');
            return;
          }

          currentDraftId = (draftResult.data as Draft).id;
        } else {
          const updateResult = await updateDraft({
            id: currentDraftId,
            title: state.title.trim(),
            content: state.content.trim(),
            contentPreview: generateContentPreview(state.content, 200),
            thumbnailUrl: state.thumbnailUrl || undefined,
            tags: state.tags,
          });

          if (!updateResult.success) {
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

        if (result?.success) {
          state.setShowPublishModal(false);
          state.setDraftStatus('published');

          toast.success(
            `Successfully published to ${
              (result.data as PublishResult).summary.successful
            } platforms! Redirecting to drafts...`
          );

          setTimeout(() => {
            router.push('/drafts');
          }, 1000);
        } else {
          toast.error(`Publish failed: ${result?.error}`);
        }
      } catch {
        toast.error('Failed to publish');
      } finally {
        state.setPublishing(false);
      }
    },
    [state, router]
  );

  const loadIntegrations = useCallback(async () => {
    try {
      const result = await listIntegrations();
      if (result.success && result.data) {
        const connected = (result.data as any[])
          .filter((integration: any) => integration.status === 'connected')
          .map((integration: any) => integration.platform);
        state.setConnectedPlatforms(connected);
      }
    } catch {
      toast.error('Failed to load integrations');
    }
  }, [state]);

  return {
    handleRewrite,
    handleTone,
    handleApplyRewriteSettings,
    handleSummarize,
    handleGenerateSuggestions,
    handleSaveDraft,
    handlePublishSubmit,
    loadIntegrations,
  };
};
