'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Send,
  Bell,
  Keyboard,
  Trash2,
  Save,
  CreditCard,
} from 'lucide-react';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { useAppStore } from '@/lib/store';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { PlanIdEnum } from '@/lib/plans';
import {
  getUserSettings,
  updateProfile,
  updateWritingDefaults,
  updatePublishingSettings,
  updateNotificationSettings,
} from '@/app/actions/user-settings';
import toast from 'react-hot-toast';

interface UserSettings {
  userId: string;
  bio?: string;
  website?: string;
  preferredTone: string;
  defaultTags: string[];
  autoGenerateUrls: boolean;
  includeReadingTime: boolean;
  defaultPublishTime: string;
  autoSchedule: boolean;
  notifications: {
    publishSuccess: boolean;
    publishErrors: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
  };
}

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'writing', name: 'Writing Defaults', icon: Edit3 },
    { id: 'publishing', name: 'Publishing', icon: Send },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard },
  ];

  useEffect(() => {
    loadUserSettings();
  }, []);

  async function loadUserSettings() {
    try {
      setIsLoading(true);
      const result = await getUserSettings();

      if (result.success && result.data) {
        setUser((result.data as any).user);
        setSettings((result.data as any).settings);
      } else {
        toast.error('Failed to load user settings');
      }
    } catch (error) {
      toast.error('Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className='p-6 max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Settings</h1>
          <p className='text-base-content/70'>
            Configure your Cross Write experience
          </p>
        </div>
        <div className='flex justify-center items-center h-64'>
          <span className='loading loading-spinner loading-lg'></span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Settings</h1>
        <p className='text-base-content/70'>
          Configure your Cross Write experience
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        <div className='lg:w-64'>
          <div className='card bg-base-100 border border-base-300 shadow-sm'>
            <div className='card-body p-4'>
              <nav className='space-y-1'>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={setActiveTab.bind(null, tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-content'
                          : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <div className='flex-1'>
          <div className='card bg-base-100 border border-base-300 shadow-sm'>
            <div className='card-body'>
              {activeTab === 'profile' && (
                <ProfileSettings
                  user={user}
                  settings={settings}
                  onSave={loadUserSettings}
                  isSaving={isSaving}
                  setIsSaving={setIsSaving}
                />
              )}
              {activeTab === 'writing' && (
                <WritingSettings
                  settings={settings}
                  onSave={loadUserSettings}
                  isSaving={isSaving}
                  setIsSaving={setIsSaving}
                />
              )}
              {activeTab === 'publishing' && (
                <PublishingSettings
                  settings={settings}
                  onSave={loadUserSettings}
                  isSaving={isSaving}
                  setIsSaving={setIsSaving}
                />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettings
                  settings={settings}
                  onSave={loadUserSettings}
                  isSaving={isSaving}
                  setIsSaving={setIsSaving}
                />
              )}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'shortcuts' && <ShortcutSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({
  user,
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: {
  user: User | null;
  settings: UserSettings | null;
  onSave: () => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}) {
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
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Profile Settings</h2>
        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Display Name</span>
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              className='input input-bordered w-full'
            />
          </div>
          <div>
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
          <div>
            <label className='label'>
              <span className='label-text'>Bio</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={e =>
                setFormData(prev => ({ ...prev, bio: e.target.value }))
              }
              className='textarea textarea-bordered w-full'
              rows={3}
            />
          </div>
          <div>
            <label className='label'>
              <span className='label-text'>Website</span>
            </label>
            <input
              type='url'
              value={formData.website}
              onChange={e =>
                setFormData(prev => ({ ...prev, website: e.target.value }))
              }
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

function WritingSettings({
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: {
  settings: UserSettings | null;
  onSave: () => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}) {
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
    } catch (error) {
      toast.error('Failed to update writing defaults');
    } finally {
      setIsSaving(false);
    }
  }

  function handleTagsChange(value: string) {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, defaultTags: tags }));
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Writing Defaults</h2>
        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Preferred Tone</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={formData.preferredTone}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  preferredTone: e.target.value as
                    | 'professional'
                    | 'casual'
                    | 'friendly'
                    | 'academic',
                }))
              }
            >
              <option value='professional'>Professional</option>
              <option value='casual'>Casual</option>
              <option value='friendly'>Friendly</option>
              <option value='academic'>Academic</option>
            </select>
          </div>
          <div>
            <label className='label'>
              <span className='label-text'>Default Tags</span>
            </label>
            <input
              type='text'
              value={formData.defaultTags.join(', ')}
              onChange={e => handleTagsChange(e.target.value)}
              placeholder='javascript, react, web-development'
              className='input input-bordered w-full'
            />
            <label className='label'>
              <span className='label-text-alt'>Separate tags with commas</span>
            </label>
          </div>
          <CustomCheckbox
            checked={formData.autoGenerateUrls}
            onChange={checked =>
              setFormData(prev => ({ ...prev, autoGenerateUrls: checked }))
            }
          >
            Auto-generate canonical URLs
          </CustomCheckbox>
          <CustomCheckbox
            checked={formData.includeReadingTime}
            onChange={checked =>
              setFormData(prev => ({ ...prev, includeReadingTime: checked }))
            }
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

function PublishingSettings({
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: {
  settings: UserSettings | null;
  onSave: () => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}) {
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
    } catch (error) {
      toast.error('Failed to update publishing settings');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Publishing Settings</h2>
        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Default Publish Time</span>
            </label>
            <input
              type='time'
              value={formData.defaultPublishTime}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  defaultPublishTime: e.target.value,
                }))
              }
              className='input input-bordered w-full'
            />
          </div>
          <CustomCheckbox
            checked={formData.autoSchedule}
            onChange={checked =>
              setFormData(prev => ({ ...prev, autoSchedule: checked }))
            }
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

function NotificationSettings({
  settings,
  onSave,
  isSaving,
  setIsSaving,
}: {
  settings: UserSettings | null;
  onSave: () => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}) {
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
      } else {
        toast.error(result.error || 'Failed to update notification settings');
      }
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsSaving(false);
    }
  }

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
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  publishSuccess: e.target.checked,
                }))
              }
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
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  publishErrors: e.target.checked,
                }))
              }
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
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  dailyDigest: e.target.checked,
                }))
              }
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium'>Weekly Report</h3>
              <p className='text-sm text-base-content/50'>
                Get a weekly analytics report
              </p>
            </div>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={formData.weeklyReport}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  weeklyReport: e.target.checked,
                }))
              }
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

function BillingSettings() {
  const { userPlan } = useAppStore();

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Billing & Plan Settings</h2>
        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Current Plan</span>
            </label>
            <div className='flex items-center space-x-2'>
              <PlanBadge planId={userPlan.planId} />
              <span className='text-sm text-base-content/50'>
                {userPlan.planId === PlanIdEnum.FREE ? 'Free Plan' : 'Pro Plan'}
              </span>
            </div>
          </div>

          <div>
            <label className='label'>
              <span className='label-text'>AI Configuration</span>
            </label>
            <div className='alert alert-info'>
              <span>
                AI features are provided by Cross Write using server-side API
                keys. No additional setup required.
              </span>
            </div>
          </div>

          <div className='flex justify-end'>
            <a href='/settings/billing' className='btn btn-primary'>
              Manage Billing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutSettings() {
  const shortcuts = [
    { action: 'New Draft', shortcut: 'N', description: 'Create a new draft' },
    { action: 'Save Draft', shortcut: '⌘S', description: 'Save current draft' },
    {
      action: 'Command Palette',
      shortcut: '⌘K',
      description: 'Open command palette',
    },
    {
      action: 'Go to Dashboard',
      shortcut: '⌘D',
      description: 'Navigate to dashboard',
    },
    { action: 'Go to Editor', shortcut: '⌘E', description: 'Open editor' },
    {
      action: 'Toggle Sidebar',
      shortcut: '⌘B',
      description: 'Show/hide sidebar',
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Keyboard Shortcuts</h2>
        <div className='space-y-4'>
          <div className='overflow-x-auto'>
            <table className='table w-full'>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Shortcut</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map(shortcut => (
                  <tr key={shortcut.action} className='hover:bg-base-200'>
                    <td className='font-medium'>{shortcut.action}</td>
                    <td>
                      <kbd className='kbd kbd-sm'>{shortcut.shortcut}</kbd>
                    </td>
                    <td className='text-sm text-base-content/50'>
                      {shortcut.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className='card bg-error/10 border border-error/20'>
        <div className='card-body'>
          <h3 className='card-title text-error'>Danger Zone</h3>
          <p className='text-sm text-base-content/70 mb-4'>
            These actions cannot be undone. Please be careful.
          </p>
          <button className='btn btn-error btn-sm'>
            <Trash2 size={16} className='mr-2' />
            Delete All Local Data
          </button>
        </div>
      </div>
    </div>
  );
}
