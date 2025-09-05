'use client';

import { Settings, Eye } from 'lucide-react';
import NextImage from 'next/image';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { QuotaHint } from '@/components/ui/QuotaHint';
import { usePlan } from '@/hooks/use-plan';

type EditorHeaderProps = {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  thumbnailUrl: string | null;
  isLoading: boolean;
  onToggleRewriteSettings: () => void;
  onTogglePreview: () => void;
};

export const EditorHeader = ({
  title,
  onTitleChange,
  thumbnailUrl,
  isLoading,
  onToggleRewriteSettings,
  onTogglePreview,
}: EditorHeaderProps) => {
  const { userPlan } = usePlan();

  return (
    <div className='flex items-center justify-between p-4 border-b border-base-300 bg-base-100'>
      <div className='flex items-center space-x-4 flex-1'>
        <input
          type='text'
          value={title}
          onChange={onTitleChange}
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
          onClick={onToggleRewriteSettings}
          className='btn btn-ghost btn-sm'
          title='AI Rewrite Settings'
          disabled={isLoading}
        >
          <Settings size={16} />
        </button>
        <button
          onClick={onTogglePreview}
          className='btn btn-ghost btn-sm'
          title='Preview'
          disabled={isLoading}
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
};
