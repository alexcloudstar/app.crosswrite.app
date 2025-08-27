'use client';

import { useState } from 'react';
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'writing', name: 'Writing Defaults', icon: Edit3 },
    { id: 'publishing', name: 'Publishing', icon: Send },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard },
  ];

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
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'writing' && <WritingSettings />}
              {activeTab === 'publishing' && <PublishingSettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'shortcuts' && <ShortcutSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
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
              defaultValue='Alex Johnson'
              className='input input-bordered w-full'
            />
          </div>
          <div>
            <label className='label'>
              <span className='label-text'>Email</span>
            </label>
            <input
              type='email'
              defaultValue='alex@example.com'
              className='input input-bordered w-full'
            />
          </div>
          <div>
            <label className='label'>
              <span className='label-text'>Bio</span>
            </label>
            <textarea
              defaultValue='Full-stack developer and content creator passionate about sharing knowledge with the developer community.'
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
              defaultValue='https://'
              className='input input-bordered w-full'
            />
          </div>
        </div>
      </div>
      <div className='flex justify-end'>
        <button className='btn btn-primary'>
          <Save size={16} className='mr-2' />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function WritingSettings() {
  const [autoGenerateUrls, setAutoGenerateUrls] = useState(true);
  const [includeReadingTime, setIncludeReadingTime] = useState(false);

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Writing Defaults</h2>
        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Preferred Tone</span>
            </label>
            <select className='select select-bordered w-full'>
              <option>Professional</option>
              <option>Casual</option>
              <option>Friendly</option>
              <option>Academic</option>
            </select>
          </div>
          <div>
            <label className='label'>
              <span className='label-text'>Default Tags</span>
            </label>
            <input
              type='text'
              placeholder='javascript, react, web-development'
              className='input input-bordered w-full'
            />
            <label className='label'>
              <span className='label-text-alt'>Separate tags with commas</span>
            </label>
          </div>
          <CustomCheckbox
            checked={autoGenerateUrls}
            onChange={setAutoGenerateUrls}
          >
            Auto-generate canonical URLs
          </CustomCheckbox>
          <CustomCheckbox
            checked={includeReadingTime}
            onChange={setIncludeReadingTime}
          >
            Include reading time estimates
          </CustomCheckbox>
        </div>
      </div>
      <div className='flex justify-end'>
        <button className='btn btn-primary'>
          <Save size={16} className='mr-2' />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function PublishingSettings() {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['dev.to']);
  const [autoSchedule, setAutoSchedule] = useState(true);

  const platforms = ['dev.to', 'Hashnode'];

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4'>Publishing Settings</h2>
        <div className='space-y-4'>
          <div>
            <label className='label'>
              <span className='label-text'>Default Platforms</span>
            </label>
            <div className='space-y-2'>
              {platforms.map(platform => (
                <CustomCheckbox
                  key={platform}
                  checked={selectedPlatforms.includes(platform)}
                  onChange={handlePlatformToggle.bind(null, platform)}
                >
                  {platform}
                </CustomCheckbox>
              ))}
            </div>
          </div>
          <div>
            <label className='label'>
              <span className='label-text'>Default Publish Time</span>
            </label>
            <input
              type='time'
              defaultValue='09:00'
              className='input input-bordered w-full'
            />
          </div>
          <CustomCheckbox checked={autoSchedule} onChange={setAutoSchedule}>
            Auto-schedule for optimal times
          </CustomCheckbox>
        </div>
      </div>
      <div className='flex justify-end'>
        <button className='btn btn-primary'>
          <Save size={16} className='mr-2' />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
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
              defaultChecked
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
              defaultChecked
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium'>Daily Digest</h3>
              <p className='text-sm text-base-content/50'>
                Receive a daily summary of your content performance
              </p>
            </div>
            <input type='checkbox' className='toggle toggle-primary' />
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
              defaultChecked
            />
          </div>
        </div>
      </div>
      <div className='flex justify-end'>
        <button className='btn btn-primary'>
          <Save size={16} className='mr-2' />
          Save Changes
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
