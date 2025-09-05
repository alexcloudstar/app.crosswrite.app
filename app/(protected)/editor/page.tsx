'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { PreviewModal } from '@/components/editor/PreviewModal';
import { ThumbnailGeneratorModal } from '@/components/editor/ThumbnailGeneratorModal';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorFooter } from '@/components/editor/EditorFooter';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { RewriteSettingsModal } from '@/components/editor/RewriteSettingsModal';
import { PublishModal } from '@/components/editor/PublishModal';
import { EditorLoadingOverlay } from '@/components/editor/EditorLoadingOverlay';
import { useEditorState } from '@/hooks/use-editor-state';
import { useEditorActions } from '@/hooks/use-editor-actions';
import { useTextFormatting } from '@/hooks/use-text-formatting';
import { supportedPlatforms } from '@/lib/config/platforms';
import { Suggestion } from '@/lib/types/ai';

export default function EditorPage() {
  // State management
  const editorState = useEditorState();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    ...supportedPlatforms,
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Actions
  const actions = useEditorActions(editorState);

  // Text formatting
  const { formatText } = useTextFormatting({
    content: editorState.content,
    setContent: editorState.setContent,
    addToHistory: editorState.addToHistory,
    undo: editorState.undo,
    redo: editorState.redo,
  });

  // Event handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    editorState.setTitle(e.target.value);

  const handleToggleRewriteSettings = () =>
    editorState.setShowRewriteSettings(!editorState.showRewriteSettings);

  const handleTogglePreview = () =>
    editorState.setShowPreview(!editorState.showPreview);

  const handleToggleThumbnailGenerator = () =>
    editorState.setShowThumbnailGenerator(!editorState.showThumbnailGenerator);

  const onChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    editorState.setContent(newContent);
    editorState.addToHistory(newContent);
  };

  const handleApplyRewriteSettings = async () => {
    editorState.setShowRewriteSettings(false);
    await actions.handleApplyRewriteSettings();
  };

  const handleGenerateSuggestions = async () => {
    const newSuggestions = await actions.handleGenerateSuggestions();
    if (newSuggestions) {
      setSuggestions(newSuggestions);
    }
  };

  const handleApplySuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      const timestamp = new Date().toLocaleTimeString();
      const suggestionNote = `\n\n---\n**AI Suggestion (${timestamp}):** ${suggestion.suggestion}\n\n*Note: This suggestion has been applied. You can edit or remove this note as needed.*`;
      const newContent = editorState.content + suggestionNote;
      editorState.setContent(newContent);
      editorState.addToHistory(newContent);

      setSuggestions(prev =>
        prev.map(s => (s.id === suggestionId ? { ...s, applied: true } : s))
      );
    }
  };

  const handlePublish = () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform to publish to.');
      return;
    }

    if (editorState.draftStatus === 'published') {
      toast.error('This draft has already been published');
      return;
    }

    editorState.setShowPublishModal(true);
  };

  const handlePublishSubmit = async () => {
    await actions.handlePublishSubmit(selectedPlatforms);
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Load integrations when publish modal opens
  useEffect(() => {
    if (!editorState.showPublishModal) return;
    actions.loadIntegrations();
  }, [editorState.showPublishModal, actions]);

  return (
    <div
      className={`h-full flex flex-col relative ${
        editorState.isLoading ? 'cursor-wait' : ''
      }`}
    >
      <EditorLoadingOverlay
        isLoading={editorState.isLoading}
        loadingType={editorState.loadingType}
      />

      <EditorHeader
        title={editorState.title}
        onTitleChange={handleTitleChange}
        thumbnailUrl={editorState.thumbnailUrl}
        isLoading={editorState.isLoading}
        onToggleRewriteSettings={handleToggleRewriteSettings}
        onTogglePreview={handleTogglePreview}
      />

      <EditorToolbar
        onGenerateThumbnail={handleToggleThumbnailGenerator}
        onRewrite={actions.handleRewrite}
        onTone={actions.handleTone}
        onSummarize={actions.handleSummarize}
        onFormatText={formatText}
        isAiLoading={editorState.isLoading}
        hasContent={!!editorState.content.trim()}
      />

      <div className='flex-1 flex overflow-hidden'>
        <div className='flex-1 flex flex-col min-h-0'>
          <div className='flex-1 overflow-y-auto'>
            <MarkdownEditor
              value={editorState.content}
              onChangeContent={onChangeContent}
              placeholder='Start writing your content...'
              disabled={editorState.isLoading}
            />
          </div>

          <EditorFooter
            wordCount={editorState.wordCount}
            readingTime={editorState.readingTime}
            isLoading={editorState.isLoading}
            loadingType={editorState.loadingType}
            content={editorState.content}
            draftStatus={editorState.draftStatus}
            onSaveDraft={actions.handleSaveDraft}
            onPublish={handlePublish}
          />
        </div>

        <EditorSidebar
          content={editorState.content}
          suggestions={suggestions}
          onGenerateSuggestions={handleGenerateSuggestions}
          isGeneratingSuggestions={editorState.loadingType === 'suggestions'}
          onApplySuggestion={handleApplySuggestion}
          tags={editorState.tags}
          onTagsChange={editorState.setTags}
          title={editorState.title}
          isLoading={editorState.isLoading}
        />
      </div>

      {editorState.showPreview && (
        <PreviewModal
          title={editorState.title}
          content={editorState.content}
          onClose={handleTogglePreview}
        />
      )}

      {editorState.showThumbnailGenerator && (
        <ThumbnailGeneratorModal
          isOpen={editorState.showThumbnailGenerator}
          onClose={handleToggleThumbnailGenerator}
          onSelect={editorState.setThumbnailUrl}
          onGeneratingChange={isGenerating =>
            editorState.setLoadingType(isGenerating ? 'thumbnail' : null)
          }
          articleTitle={editorState.title}
          articleContent={editorState.content}
        />
      )}

      <RewriteSettingsModal
        isOpen={editorState.showRewriteSettings}
        selectedTone={editorState.selectedTone}
        selectedLength={editorState.selectedLength}
        onToneChange={editorState.setSelectedTone}
        onLengthChange={editorState.setSelectedLength}
        onClose={handleToggleRewriteSettings}
        onApply={handleApplyRewriteSettings}
      />

      <PublishModal
        isOpen={editorState.showPublishModal}
        selectedPlatforms={selectedPlatforms}
        connectedPlatforms={editorState.connectedPlatforms}
        publishing={editorState.publishing}
        onClose={() => editorState.setShowPublishModal(false)}
        onPlatformToggle={handlePlatformToggle}
        onPublish={handlePublishSubmit}
      />
    </div>
  );
}
