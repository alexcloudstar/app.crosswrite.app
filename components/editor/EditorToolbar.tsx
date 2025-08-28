'use client';

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Sparkles,
  MessageSquare,
  FileText,
  Quote,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface EditorToolbarProps {
  onGenerateThumbnail?: () => void;
  onRewrite?: () => void;
  onTone?: () => void;
  onSummarize?: () => void;
  onFormatText?: (format: string) => void;
  isAiLoading?: boolean;
  hasContent?: boolean;
}

export function EditorToolbar({
  onGenerateThumbnail,
  onRewrite,
  onTone,
  onSummarize,
  onFormatText,
  isAiLoading = false,
  hasContent = true,
}: EditorToolbarProps) {
  const { canGenerateThumbnail } = useAppStore();

  return (
    <div className='flex items-center space-x-1 p-2 border-b border-base-300 bg-base-100'>
      <div className='flex items-center space-x-1'>
        <button
          className='btn btn-ghost btn-sm'
          title='Bold (Ctrl+B)'
          onClick={onFormatText?.bind(null, 'bold')}
        >
          <Bold size={16} />
        </button>
        <button
          className='btn btn-ghost btn-sm'
          title='Italic (Ctrl+I)'
          onClick={onFormatText?.bind(null, 'italic')}
        >
          <Italic size={16} />
        </button>
        <button
          className='btn btn-ghost btn-sm'
          title='Code (Ctrl+`)'
          onClick={onFormatText?.bind(null, 'code')}
        >
          <Code size={16} />
        </button>
        <button
          className='btn btn-ghost btn-sm'
          title='Quote'
          onClick={onFormatText?.bind(null, 'quote')}
        >
          <Quote size={16} />
        </button>
      </div>

      <div className='divider divider-horizontal mx-2'></div>

      <div className='flex items-center space-x-1'>
        <button
          className='btn btn-ghost btn-sm'
          title='Bullet List'
          onClick={onFormatText?.bind(null, 'bullet-list')}
        >
          <List size={16} />
        </button>
        <button
          className='btn btn-ghost btn-sm'
          title='Numbered List'
          onClick={onFormatText?.bind(null, 'numbered-list')}
        >
          <ListOrdered size={16} />
        </button>
      </div>

      <div className='divider divider-horizontal mx-2'></div>

      <div className='flex items-center space-x-1'>
        <button
          className='btn btn-ghost btn-sm'
          title={!hasContent ? 'Add content to rewrite' : 'AI Rewrite'}
          onClick={onRewrite}
          disabled={isAiLoading || !hasContent}
        >
          <Sparkles size={16} />
          <span className='ml-1 text-xs'>
            {isAiLoading ? 'Processing...' : 'Rewrite'}
          </span>
        </button>
        <button
          className='btn btn-ghost btn-sm'
          title={!hasContent ? 'Add content to adjust tone' : 'Fix Tone'}
          onClick={onTone}
          disabled={isAiLoading || !hasContent}
        >
          <MessageSquare size={16} />
          <span className='ml-1 text-xs'>
            {isAiLoading ? 'Processing...' : 'Tone'}
          </span>
        </button>
        <button
          className='btn btn-ghost btn-sm'
          title={!hasContent ? 'Add content to summarize' : 'Summarize'}
          onClick={onSummarize}
          disabled={isAiLoading || !hasContent}
        >
          <FileText size={16} />
          <span className='ml-1 text-xs'>
            {isAiLoading ? 'Processing...' : 'Summarize'}
          </span>
        </button>
      </div>

      <div className='divider divider-horizontal mx-2'></div>

      <div className='flex items-center space-x-1'>
        <button
          className={`btn btn-sm ${
            canGenerateThumbnail() ? 'btn-ghost' : 'btn-disabled'
          }`}
          title={
            canGenerateThumbnail()
              ? 'Generate AI Thumbnail'
              : 'Thumbnail generation limit reached'
          }
          onClick={onGenerateThumbnail}
          disabled={!canGenerateThumbnail()}
        >
          <ImageIcon size={16} />
          <span className='ml-1 text-xs'>Thumbnail</span>
        </button>
      </div>
    </div>
  );
}
