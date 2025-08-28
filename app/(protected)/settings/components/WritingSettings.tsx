'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { updateWritingDefaults } from '@/app/actions/user-settings';
import toast from 'react-hot-toast';

import { SettingsComponentProps } from './types';

export function WritingSettings({
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: SettingsComponentProps) {
  const [formData, setFormData] = useState({
    preferredTone:
      (settings?.preferredTone as
        | 'professional'
        | 'casual'
        | 'friendly'
        | 'academic') || 'professional',
    defaultTags: settings?.defaultTags || [],
    autoGenerateUrls: settings?.autoGenerateUrls ?? true,
    includeReadingTime: settings?.includeReadingTime ?? false,
  });
  const [tagsInput, setTagsInput] = useState(
    settings?.defaultTags?.join(', ') || ''
  );

  useEffect(() => {
    setFormData({
      preferredTone:
        (settings?.preferredTone as
          | 'professional'
          | 'casual'
          | 'friendly'
          | 'academic') || 'professional',
      defaultTags: settings?.defaultTags || [],
      autoGenerateUrls: settings?.autoGenerateUrls ?? true,
      includeReadingTime: settings?.includeReadingTime ?? false,
    });
    setTagsInput(settings?.defaultTags?.join(', ') || '');
  }, [settings]);

  async function handleSave() {
    try {
      setIsSaving(true);
      const result = await updateWritingDefaults(formData);

      if (result.success) {
        toast.success('Writing defaults updated successfully');
        onSave();
      } else {
        toast.error(result.error || 'Failed to update writing defaults');
      }
    } catch {
      toast.error('Failed to update writing defaults');
    } finally {
      setIsSaving(false);
    }
  }

  function handleTagsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTagsInput(e.target.value);

    const tags = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, defaultTags: tags }));
  }

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      preferredTone: e.target.value as
        | 'professional'
        | 'casual'
        | 'friendly'
        | 'academic',
    }));
  };

  const handleAutoGenerateUrlsChange = (checked: boolean) =>
    setFormData(prev => ({ ...prev, autoGenerateUrls: checked }));

  const handleIncludeReadingTimeChange = (checked: boolean) =>
    setFormData(prev => ({ ...prev, includeReadingTime: checked }));

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Writing Defaults</h2>
        <div className='space-y-4'>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Preferred Tone</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={formData.preferredTone}
              onChange={handleToneChange}
            >
              <option value='professional'>Professional</option>
              <option value='casual'>Casual</option>
              <option value='friendly'>Friendly</option>
              <option value='academic'>Academic</option>
            </select>
          </div>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Default Tags</span>
            </label>
            <input
              type='text'
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder='javascript, react, web-development'
              className='input input-bordered w-full'
            />
            <label className='label'>
              <span className='label-text-alt'>Separate tags with commas</span>
            </label>
          </div>
          <CustomCheckbox
            checked={formData.autoGenerateUrls}
            onChange={handleAutoGenerateUrlsChange}
          >
            Auto-generate canonical URLs
          </CustomCheckbox>
          <CustomCheckbox
            checked={formData.includeReadingTime}
            onChange={handleIncludeReadingTimeChange}
          >
            Include reading time estimates
          </CustomCheckbox>
        </div>
      </div>
      <div className='flex justify-end'>
        <button
          className='btn btn-primary'
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <span className='loading loading-spinner loading-sm'></span>
          ) : (
            <Save size={16} className='mr-2' />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
