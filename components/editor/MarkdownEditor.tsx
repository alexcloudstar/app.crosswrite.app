'use client';

import { useEffect, useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChangeContent: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChangeContent,
  placeholder,
  disabled = false,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className='p-6'>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChangeContent}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-transparent border-none outline-none resize-none text-base leading-relaxed font-mono ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
