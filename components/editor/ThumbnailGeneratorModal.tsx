'use client';

import { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Check,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { generateThumbnail, generateThumbnailPrompt } from '@/app/actions/ai';

interface ThumbnailGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
  articleTitle?: string;
  articleContent?: string;
}

const ASPECT_RATIOS = [
  { value: '16:9', label: 'Widescreen (16:9)' },
  { value: '2:1', label: 'Landscape (2:1)' },
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:3', label: 'Standard (4:3)' },
];

const SIZES = [
  { value: 'small', label: 'Small (800x450)' },
  { value: 'medium', label: 'Medium (1200x675)' },
  { value: 'large', label: 'Large (1920x1080)' },
];

export function ThumbnailGeneratorModal({
  isOpen,
  onClose,
  onSelect,
  onGeneratingChange,
  articleTitle,
  articleContent,
}: ThumbnailGeneratorModalProps) {
  const { canGenerateThumbnail, incrementThumbnailUsage } = useAppStore();
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [size, setSize] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerateFromArticle = async () => {
    if (!articleTitle || !articleContent || !canGenerateThumbnail()) return;

    setIsGenerating(true);
    onGeneratingChange?.(true);

    try {
      // First, generate the AI prompt from the article
      const promptResult = await generateThumbnailPrompt({
        title: articleTitle,
        content: articleContent,
        aspectRatio: aspectRatio as '16:9' | '1:1' | '4:5' | '2:1',
      });

      if (!promptResult.success) {
        throw new Error(promptResult.error || 'Failed to generate AI prompt');
      }

      const prompt = (promptResult.data as { thumbnailPrompt: string })
        .thumbnailPrompt;

      // Then generate the thumbnail using the AI prompt
      const thumbnailResult = await generateThumbnail({
        prompt: prompt,
        aspectRatio: aspectRatio as '16:9' | '1:1' | '4:5' | '2:1',
        size: size as 'small' | 'medium' | 'large',
      });

      if (!thumbnailResult.success) {
        throw new Error(
          thumbnailResult.error || 'Failed to generate thumbnails'
        );
      }

      setGeneratedImages((thumbnailResult.data as { images: string[] }).images);
      incrementThumbnailUsage();
    } catch (error) {
      console.error('Failed to generate thumbnails from article:', error);
    } finally {
      setIsGenerating(false);
      onGeneratingChange?.(false);
    }
  };

  const onChangeAspectRatio = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setAspectRatio(e.target.value);

  const onSetSize = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSize(e.target.value);

  const handleSelectImage = (imageUrl: string) => setSelectedImage(imageUrl);

  const handleUseImage = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal modal-open'>
      <div className={`modal-box max-w-4xl ${isGenerating ? 'relative' : ''}`}>
        {isGenerating && (
          <div className='absolute inset-0 bg-base-300/20 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center'>
            <div className='flex flex-col items-center space-y-2'>
              <div className='loading loading-spinner loading-md text-primary'></div>
              <p className='text-sm font-medium'>Generating thumbnails...</p>
            </div>
          </div>
        )}
        <div className='flex items-center justify-between mb-6'>
          <h3 className='font-bold text-lg flex items-center'>
            <ImageIcon size={20} className='mr-2' />
            Generate AI Thumbnail
          </h3>
          <button
            onClick={onClose}
            className='btn btn-ghost btn-sm'
            disabled={isGenerating}
          >
            <X size={16} />
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <div>
              <label className='label'>
                <span className='label-text font-medium'>Aspect Ratio</span>
              </label>
              <select
                value={aspectRatio}
                onChange={onChangeAspectRatio}
                className='select select-bordered w-full'
                disabled={isGenerating}
              >
                {ASPECT_RATIOS.map(ratio => (
                  <option key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='label'>
                <span className='label-text font-medium'>Size</span>
              </label>
              <select
                value={size}
                onChange={onSetSize}
                className='select select-bordered w-full'
                disabled={isGenerating}
              >
                {SIZES.map(sizeOption => (
                  <option key={sizeOption.value} value={sizeOption.value}>
                    {sizeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateFromArticle}
              disabled={
                !canGenerateThumbnail() ||
                isGenerating ||
                !articleTitle ||
                !articleContent
              }
              className='btn btn-primary w-full'
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className='animate-spin mr-2' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} className='mr-2' />
                  Generate from Article
                </>
              )}
            </button>

            {!canGenerateThumbnail() && (
              <div className='alert alert-warning'>
                <span>
                  You&apos;ve reached your thumbnail generation limit for this
                  month.
                </span>
              </div>
            )}

            {(!articleTitle || !articleContent) && (
              <div className='alert alert-info'>
                <span>
                  Add some content to your article to generate relevant
                  thumbnails.
                </span>
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <h4 className='font-medium'>Generated Thumbnails</h4>

            {generatedImages.length === 0 ? (
              <div className='border-2 border-dashed border-base-300 rounded-lg p-8 text-center'>
                <ImageIcon
                  width={48}
                  height={48}
                  className='mx-auto mb-4 text-base-content/30'
                />
                <p className='text-base-content/50'>
                  Click &quot;Generate from Article&quot; to create AI-powered
                  thumbnails based on your content
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4'>
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === imageUrl
                        ? 'border-primary'
                        : 'border-base-300 hover:border-base-400'
                    }`}
                    onClick={() => handleSelectImage(imageUrl)}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Generated thumbnail ${index + 1}`}
                      width={400}
                      height={225}
                      className='w-full h-auto'
                    />
                    {selectedImage === imageUrl && (
                      <div className='absolute top-2 right-2 bg-primary text-primary-content rounded-full p-1'>
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className='flex gap-2'>
                <button
                  onClick={handleUseImage}
                  disabled={!selectedImage}
                  className='btn btn-primary flex-1'
                >
                  <Download size={16} className='mr-2' />
                  Use Selected Thumbnail
                </button>
                <button
                  onClick={handleGenerateFromArticle}
                  disabled={!canGenerateThumbnail() || isGenerating}
                  className='btn btn-outline'
                >
                  <RefreshCw size={16} className='mr-2' />
                  Generate More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
