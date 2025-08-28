'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { updateProfile } from '@/app/actions/user-settings';
import toast from 'react-hot-toast';

import { ProfileSettingsProps } from './types';

export function ProfileSettings({
  user,
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: ProfileSettingsProps) {
  const { update: updateSession } = useSession();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: settings?.bio || '',
    website: settings?.website || '',
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      bio: settings?.bio || '',
      website: settings?.website || '',
    });
  }, [user, settings]);

  async function handleSave() {
    try {
      setIsSaving(true);
      const result = await updateProfile(formData);

      if (result.success) {
        toast.success('Profile updated successfully');
        onSave();
        updateSession();
        return;
      }

      toast.error(result.error || 'Failed to update profile');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, name: e.target.value }));

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, bio: e.target.value }));

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, website: e.target.value }));

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Profile Settings</h2>
        <div className='space-y-4'>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Display Name</span>
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={handleNameChange}
              className='input input-bordered w-full'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Email</span>
            </label>
            <input
              type='email'
              value={user?.email || ''}
              disabled
              className='input input-bordered w-full opacity-50'
            />
            <label className='label'>
              <span className='label-text-alt'>Email cannot be changed</span>
            </label>
          </div>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Bio</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={handleBioChange}
              className='textarea textarea-bordered w-full'
              rows={3}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='label'>
              <span className='label-text'>Website</span>
            </label>
            <input
              type='url'
              value={formData.website}
              onChange={handleWebsiteChange}
              className='input input-bordered w-full'
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
