'use client';

import { useCallback, useEffect } from 'react';

type TextFormattingState = {
  content: string;
  setContent: (content: string) => void;
  addToHistory: (content: string) => void;
  undo: () => void;
  redo: () => void;
};

export const useTextFormatting = (state: TextFormattingState) => {
  const formatText = useCallback(
    (format: string) => {
      const textarea = document.querySelector(
        'textarea'
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = state.content.substring(start, end);

      if (selectedText.length === 0) {
        const before = state.content.substring(0, start);
        const after = state.content.substring(end);

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

        state.setContent(newText);
        state.addToHistory(newText);

        setTimeout(() => {
          textarea.focus();
          const newPosition =
            start + newText.length - before.length - after.length;
          textarea.setSelectionRange(newPosition - 8, newPosition - 1);
        }, 0);
      } else {
        const before = state.content.substring(0, start);
        const after = state.content.substring(end);

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

        state.setContent(newText);
        state.addToHistory(newText);

        setTimeout(() => {
          textarea.focus();
          const formattedLength = newText.length - before.length - after.length;
          textarea.setSelectionRange(start, start + formattedLength);
        }, 0);
      }
    },
    [state]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const textarea = document.querySelector('textarea');
      if (document.activeElement !== textarea) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              state.redo();
            } else {
              state.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            state.redo();
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
  }, [formatText, state.undo, state.redo]);

  return {
    formatText,
  };
};
