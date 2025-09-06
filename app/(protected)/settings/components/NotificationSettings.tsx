'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { updateNotificationSettings } from '@/app/actions/user-settings';
import toast from 'react-hot-toast';

import { SettingsComponentProps } from './types';

export function NotificationSettings({
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: SettingsComponentProps) {
  const [formData, setFormData] = useState({
    publishSuccess: settings?.notifications?.publishSuccess ?? true,
    publishErrors: settings?.notifications?.publishErrors ?? true,
    dailyDigest: settings?.notifications?.dailyDigest ?? false,
    weeklyReport: settings?.notifications?.weeklyReport ?? true,
  });

  useEffect(() => {
    setFormData({
      publishSuccess: settings?.notifications?.publishSuccess ?? true,
      publishErrors: settings?.notifications?.publishErrors ?? true,
      dailyDigest: settings?.notifications?.dailyDigest ?? false,
      weeklyReport: settings?.notifications?.weeklyReport ?? true,
    });
  }, [settings]);

  async function handleSave() {
    try {
      setIsSaving(true);
      const result = await updateNotificationSettings(formData);

      if (result.success) {
        toast.success('Notification settings updated successfully');
        onSave();
        return;
      }

      toast.error(result.error || 'Failed to update notification settings');
    } catch {
      toast.error('Failed to update notification settings');
    } finally {
      setIsSaving(false);
    }
  }

  const handlePublishSuccessChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({
      ...prev,
      publishSuccess: e.target.checked,
    }));

  const handlePublishErrorsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({
      ...prev,
      publishErrors: e.target.checked,
    }));

  const handleDailyDigestChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({
      ...prev,
      dailyDigest: e.target.checked,
    }));

  const handleWeeklyReportChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({
      ...prev,
      weeklyReport: e.target.checked,
    }));

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Notification Preferences</h2>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium'>Publish Success</h3>
              <p className='text-sm text-base-content/50'>
                Get notified when posts are successfully published
              </p>
            </div>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={formData.publishSuccess}
              onChange={handlePublishSuccessChange}
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium'>Publish Errors</h3>
              <p className='text-sm text-base-content/50'>
                Get notified when publishing fails
              </p>
            </div>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={formData.publishErrors}
              onChange={handlePublishErrorsChange}
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium'>Daily Digest</h3>
              <p className='text-sm text-base-content/50'>
                Receive a daily summary of your content performance
              </p>
            </div>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={formData.dailyDigest}
              onChange={handleDailyDigestChange}
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium'>Weekly Report</h3>
              <p className='text-sm text-base-content/50'>
                Get a weekly content report
              </p>
            </div>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={formData.weeklyReport}
              onChange={handleWeeklyReportChange}
            />
          </div>
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
