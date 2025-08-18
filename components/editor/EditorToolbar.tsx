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
}

export function EditorToolbar({ onGenerateThumbnail }: EditorToolbarProps) {
  const { canGenerateThumbnail } = useAppStore();

  return (
    <div className='flex items-center space-x-1 p-2 border-b border-base-300 bg-base-100'>
      <div className='flex items-center space-x-1'>
        <button className='btn btn-ghost btn-sm' title='Bold (Ctrl+B)'>
          <Bold size={16} />
        </button>
        <button className='btn btn-ghost btn-sm' title='Italic (Ctrl+I)'>
          <Italic size={16} />
        </button>
        <button className='btn btn-ghost btn-sm' title='Code (Ctrl+`)'>
          <Code size={16} />
        </button>
        <button className='btn btn-ghost btn-sm' title='Quote'>
          <Quote size={16} />
        </button>
      </div>

      <div className='divider divider-horizontal mx-2'></div>

      <div className='flex items-center space-x-1'>
        <button className='btn btn-ghost btn-sm' title='Bullet List'>
          <List size={16} />
        </button>
        <button className='btn btn-ghost btn-sm' title='Numbered List'>
          <ListOrdered size={16} />
        </button>
      </div>

      <div className='divider divider-horizontal mx-2'></div>

      <div className='flex items-center space-x-1'>
        <button className='btn btn-ghost btn-sm' title='AI Rewrite'>
          <Sparkles size={16} />
          <span className='ml-1 text-xs'>Rewrite</span>
        </button>
        <button className='btn btn-ghost btn-sm' title='Fix Tone'>
          <MessageSquare size={16} />
          <span className='ml-1 text-xs'>Tone</span>
        </button>
        <button className='btn btn-ghost btn-sm' title='Summarize'>
          <FileText size={16} />
          <span className='ml-1 text-xs'>Summarize</span>
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
