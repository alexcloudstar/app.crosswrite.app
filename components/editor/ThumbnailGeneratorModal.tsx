'use client';

import { generateThumbnail } from '@/app/actions/ai';
import { useAppStore } from '@/lib/store';
import {
  Check,
  Download,
  Image as ImageIcon,
  RefreshCw,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

type ThumbnailGeneratorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
  articleTitle: string;
  articleContent: string;
};

export function ThumbnailGeneratorModal({
  isOpen,
  onClose,
  onSelect,
  onGeneratingChange,
  articleTitle,
  articleContent,
}: ThumbnailGeneratorModalProps) {
  const { canGenerateThumbnail, incrementThumbnailUsage } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!canGenerateThumbnail()) return;

    setIsGenerating(true);
    onGeneratingChange?.(true);

    try {
      const result = await generateThumbnail({
        articleTitle,
        articleContent,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate thumbnail');
      }

      setGeneratedImages((result.data as { images: string[] }).images);
      incrementThumbnailUsage();
    } catch {
      toast.error('Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
      onGeneratingChange?.(false);
    }
  };

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
              <p className='text-sm font-medium'>Generating thumbnail...</p>
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
            <div className='bg-base-200 rounded-lg p-4'>
              <h4 className='font-medium mb-2'>Article Context</h4>
              <p className='text-sm text-base-content/70 mb-2'>
                <strong>Title:</strong> {articleTitle}
              </p>
            </div>

            <div className='space-y-4'>
              <button
                onClick={handleGenerate}
                disabled={!canGenerateThumbnail() || isGenerating}
                className='btn btn-primary w-full'
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className='animate-spin mr-2' />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon size={16} className='mr-2' />
                    Generate Thumbnail
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
            </div>
          </div>

          <div className='space-y-4'>
            <h4 className='font-medium'>Generated Thumbnail</h4>

            {generatedImages.length === 0 ? (
              <div className='border-2 border-dashed border-base-300 rounded-lg p-8 text-center'>
                <ImageIcon
                  width={48}
                  height={48}
                  className='mx-auto mb-4 text-base-content/30'
                />
                <p className='text-base-content/50'>
                  Click &quot;Generate Thumbnail&quot; to create an AI-powered
                  thumbnail based on your article
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={`thumbnail-${index}`}
                    className={`relative border-2 rounded-lg overflow-hidden ${
                      selectedImage === imageUrl
                        ? 'border-primary'
                        : 'border-base-300'
                    } ${
                      isGenerating
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    }`}
                    onClick={
                      isGenerating
                        ? undefined
                        : handleSelectImage.bind(null, imageUrl)
                    }
                  >
                    <Image
                      src={imageUrl}
                      alt={`Generated thumbnail ${index + 1}`}
                      width={600}
                      height={300}
                      className='w-full h-48 object-cover'
                    />
                    {selectedImage === imageUrl && (
                      <div className='absolute top-2 right-2 bg-primary text-primary-content rounded-full p-1'>
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}

                {selectedImage && (
                  <button
                    onClick={handleUseImage}
                    className='btn btn-success w-full'
                    disabled={isGenerating}
                  >
                    <Download size={16} className='mr-2' />
                    Use as Cover
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
