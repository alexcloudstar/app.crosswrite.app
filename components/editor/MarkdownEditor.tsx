'use client';

import { useEffect, useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChangeContent: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChangeContent,
  placeholder,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className='flex-1 p-6'>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChangeContent}
        placeholder={placeholder}
        className='w-full h-full bg-transparent border-none outline-none resize-none text-base leading-relaxed font-mono'
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
