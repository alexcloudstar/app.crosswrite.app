'use client';

import { useAppStore } from '@/lib/store';
import { getPlatformShortcut } from '@/lib/utils';
import { Bell, LogOut, Search, Settings, User, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CommandPalette } from './CommandPalette';

export function Topbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { openCommandPalette } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [platformShortcut, setPlatformShortcut] = useState('CtrlK');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlatformShortcut(getPlatformShortcut('K'));
  }, []);

  const handleProfile = () => {
    router.push('/settings');
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    router.push('/settings');
    setShowUserMenu(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/sign-in' });
    setShowUserMenu(false);
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    setShowAllNotifications(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  const onToggleAllNotifications = () => setShowAllNotifications(false);

  const onToggleNotifications = () => setShowNotifications(prev => !prev);

  const onToggleUserMenu = () => setShowUserMenu(prev => !prev);

  return (
    <>
      <div className='h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-6'>
        <div className='flex-1 max-w-md'>
          <button
            onClick={openCommandPalette}
            className='w-full flex items-center px-4 py-2 bg-base-200 rounded-lg text-base-content/70 hover:bg-base-300 transition-colors cursor-pointer'
          >
            <Search size={16} className='mr-3' />
            <span className='text-sm'>
              Search or press {platformShortcut}...
            </span>
          </button>
        </div>

        <div className='flex items-center space-x-3 ml-4'>
          <div className='relative' ref={notificationRef}>
            <button
              onClick={onToggleNotifications}
              className='btn btn-ghost btn-sm btn-circle relative'
            >
              <Bell size={16} />
            </button>

            {showNotifications && (
              <div className='absolute right-0 mt-2 w-80 bg-base-200 rounded-lg shadow-lg border border-base-300 py-1 z-50'>
                <div className='px-4 py-2 border-b border-base-300'>
                  <p className='text-sm font-medium'>Notifications</p>
                </div>
                <div className='px-4 py-6 text-center'>
                  <div className='inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3'>
                    <Bell className='w-6 h-6 text-primary' />
                  </div>
                  <p className='text-sm font-medium mb-2'>Coming Soon!</p>
                  <p className='text-xs text-base-content/70'>
                    We&apos;re working on bringing you comprehensive
                    notification preferences.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className='relative' ref={userMenuRef}>
            <button
              onClick={onToggleUserMenu}
              className='flex items-center space-x-2 p-2 rounded-lg hover:bg-base-200 transition-colors'
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className='w-8 h-8 rounded-full object-cover'
                />
              ) : (
                <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                  <span className='text-primary-content font-medium text-sm'>
                    {session?.user?.name?.charAt(0)?.toUpperCase() ||
                      session?.user?.email?.charAt(0)?.toUpperCase() ||
                      'U'}
                  </span>
                </div>
              )}
              <User size={16} />
            </button>

            {showUserMenu && (
              <div className='absolute right-0 mt-2 w-48 bg-base-200 rounded-lg shadow-lg border border-base-300 py-1 z-50'>
                <div className='px-4 py-2 border-b border-base-300'>
                  <p className='text-sm font-medium'>
                    {session?.user?.name || 'User'}
                  </p>
                  <p className='text-xs text-base-content/70'>
                    {session?.user?.email || 'No email'}
                  </p>
                </div>
                <button
                  onClick={handleProfile}
                  className='w-full text-left px-4 py-2 text-sm hover:bg-base-300 flex items-center'
                >
                  <User size={16} className='mr-2' />
                  Profile
                </button>
                <button
                  onClick={handleSettings}
                  className='w-full text-left px-4 py-2 text-sm hover:bg-base-300 flex items-center'
                >
                  <Settings size={16} className='mr-2' />
                  Settings
                </button>
                <div className='border-t border-base-300 my-1'></div>
                <button
                  onClick={handleSignOut}
                  className='w-full text-left px-4 py-2 text-sm hover:bg-base-300 text-error flex items-center'
                >
                  <LogOut size={16} className='mr-2' />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAllNotifications && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-lg'>All Notifications</h3>
              <button
                onClick={onToggleAllNotifications}
                className='btn btn-ghost btn-sm btn-circle'
              >
                <X size={16} />
              </button>
            </div>
            <div className='text-center py-12'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6'>
                <Bell className='w-8 h-8 text-primary' />
              </div>
              <h3 className='text-xl font-bold mb-4'>
                Notifications Coming Soon!
              </h3>
              <p className='text-base-content/70 max-w-md mx-auto'>
                We&apos;re working on bringing you comprehensive notification
                preferences for publishing success, errors, daily digests, and
                weekly reports.
              </p>
            </div>
            <div className='modal-action'>
              <button
                onClick={onToggleAllNotifications}
                className='btn btn-primary'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <CommandPalette />
    </>
  );
}
