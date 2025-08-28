'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { updatePublishingSettings } from '@/app/actions/user-settings';
import toast from 'react-hot-toast';

import { SettingsComponentProps } from './types';

export function PublishingSettings({
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: SettingsComponentProps) {
  const [formData, setFormData] = useState({
    defaultPublishTime: settings?.defaultPublishTime || '09:00',
    autoSchedule: settings?.autoSchedule ?? true,
  });

  useEffect(() => {
    setFormData({
      defaultPublishTime: settings?.defaultPublishTime || '09:00',
      autoSchedule: settings?.autoSchedule ?? true,
    });
  }, [settings]);

  async function handleSave() {
    try {
      setIsSaving(true);
      const result = await updatePublishingSettings(formData);

      if (result.success) {
        toast.success('Publishing settings updated successfully');
        onSave();
      } else {
        toast.error(result.error || 'Failed to update publishing settings');
      }
    } catch {
      toast.error('Failed to update publishing settings');
    } finally {
      setIsSaving(false);
    }
  }

  const handlePublishTimeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({
      ...prev,
      defaultPublishTime: e.target.value,
    }));

  const handleAutoScheduleChange = (checked: boolean) =>
    setFormData(prev => ({ ...prev, autoSchedule: checked }));

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Publishing Settings</h2>
        <div className='space-y-4'>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Default Publish Time</span>
            </label>
            <input
              type='time'
              value={formData.defaultPublishTime}
              onChange={handlePublishTimeChange}
              className='input input-bordered w-full'
            />
          </div>
          <CustomCheckbox
            checked={formData.autoSchedule}
            onChange={handleAutoScheduleChange}
          >
            Auto-schedule for optimal times
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
