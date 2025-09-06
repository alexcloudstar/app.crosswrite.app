'use client';

import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Edit3,
  Send,
  Bell,
  Keyboard,
  CreditCard,
} from 'lucide-react';
import { getUserSettings } from '@/app/actions/user-settings';
import toast from 'react-hot-toast';
import {
  ProfileSettings,
  WritingSettings,
  PublishingSettings,
  BillingSettings,
  ShortcutSettings,
  UserSettings,
  User,
} from './components';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
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
        setUser((result.data as { user: User; settings: UserSettings }).user);
        setSettings(
          (result.data as { user: User; settings: UserSettings }).settings
        );
        return;
      }

      toast.error('Failed to load user settings');
    } catch {
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
              {activeTab === 'publishing' && <PublishingSettings />}
              {activeTab === 'notifications' && (
                <div className='text-center py-12'>
                  <div className='inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6'>
                    <Bell className='w-8 h-8 text-primary' />
                  </div>
                  <h2 className='text-2xl font-bold mb-4'>
                    Notifications Coming Soon!
                  </h2>
                  <p className='text-lg text-base-content/70 max-w-md mx-auto'>
                    We&apos;re working on bringing you comprehensive
                    notification preferences for publishing success, errors,
                    daily digests, and weekly reports.
                  </p>
                </div>
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
