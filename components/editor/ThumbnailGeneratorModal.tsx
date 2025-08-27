'use client';

import { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Check,
} from 'lucide-react';
import { generateThumbnail } from '@/app/actions/ai';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

interface ThumbnailGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

const THUMBNAIL_PRESETS = [
  {
    name: 'Tech Blog',
    prompt:
      'Modern tech blog header with clean typography, gradient background, tech icons',
    aspectRatio: '16:9',
  },
  {
    name: 'Tutorial',
    prompt:
      'Educational tutorial header with step-by-step visual elements, blue theme',
    aspectRatio: '16:9',
  },
  {
    name: 'Newsletter',
    prompt:
      'Professional newsletter header with elegant typography, subtle patterns',
    aspectRatio: '2:1',
  },
  {
    name: 'Social Media',
    prompt:
      'Eye-catching social media post with bold colors, modern design elements',
    aspectRatio: '1:1',
  },
];

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
}: ThumbnailGeneratorModalProps) {
  const { canGenerateThumbnail, incrementThumbnailUsage } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [size, setSize] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const currentPrompt =
    customPrompt || THUMBNAIL_PRESETS[selectedPreset].prompt;

  const handleGenerate = async () => {
    if (!canGenerateThumbnail()) return;

    setIsGenerating(true);

    try {
      const result = await generateThumbnail({
        title: currentPrompt,
        style: 'clean',
        aspect: aspectRatio as '16:9' | '1:1' | '4:5',
      });

      if (result.success && result.data) {
        const data = result.data as {
          imageUrl: string;
          title: string;
          style: string;
          aspect: string;
        };
        incrementThumbnailUsage();
        setGeneratedImages([data.imageUrl]);
        setSelectedImage(data.imageUrl);
      } else {
        throw new Error(result.error || 'Failed to generate thumbnail');
      }
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      alert('Failed to generate thumbnail. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const onChangeCustomPrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setCustomPrompt(e.target.value);

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
      <div className='modal-box max-w-4xl'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='font-bold text-lg flex items-center'>
            <ImageIcon size={20} className='mr-2' />
            Generate AI Thumbnail
          </h3>
          <button onClick={onClose} className='btn btn-ghost btn-sm'>
            <X size={16} />
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <div>
              <label className='label'>
                <span className='label-text font-medium'>Presets</span>
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {THUMBNAIL_PRESETS.map((preset, index) => (
                  <button
                    key={preset.name}
                    onClick={setSelectedPreset.bind(null, index)}
                    className={`btn btn-outline btn-sm ${
                      selectedPreset === index ? 'btn-primary' : ''
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='label'>
                <span className='label-text font-medium'>Custom Prompt</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={onChangeCustomPrompt}
                placeholder='Describe the thumbnail you want to generate...'
                className='textarea textarea-bordered w-full'
                rows={3}
              />
            </div>

            <div>
              <label className='label'>
                <span className='label-text font-medium'>Aspect Ratio</span>
              </label>
              <select
                value={aspectRatio}
                onChange={onChangeAspectRatio}
                className='select select-bordered w-full'
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
              >
                {SIZES.map(sizeOption => (
                  <option key={sizeOption.value} value={sizeOption.value}>
                    {sizeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerateThumbnail() || isGenerating}
              className={`btn btn-primary w-full ${
                isGenerating ? 'loading' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className='animate-spin mr-2' />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon size={16} className='mr-2' />
                  Generate Thumbnails
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
                  Click &quot;Generate Thumbnails&quot; to create AI-powered
                  thumbnails
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-4'>
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                      selectedImage === imageUrl
                        ? 'border-primary'
                        : 'border-base-300'
                    }`}
                    onClick={handleSelectImage.bind(null, imageUrl)}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Generated thumbnail ${index + 1}`}
                      width={400}
                      height={200}
                      className='w-full h-32 object-cover'
                    />
                    {selectedImage === imageUrl && (
                      <div className='absolute top-2 right-2 bg-primary text-primary-content rounded-full p-1'>
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedImage && (
              <div className='space-y-4'>
                <div className='border rounded-lg p-4'>
                  <Image
                    src={selectedImage}
                    alt='Selected thumbnail'
                    width={600}
                    height={300}
                    className='w-full h-48 object-cover rounded'
                  />
                </div>
                <button
                  onClick={handleUseImage}
                  className='btn btn-success w-full'
                >
                  <Download size={16} className='mr-2' />
                  Use as Cover
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
