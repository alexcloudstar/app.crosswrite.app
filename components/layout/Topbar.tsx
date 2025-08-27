'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Calendar,
  Zap,
  User,
  Settings,
  LogOut,
  Bell,
  X,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CommandPalette } from './CommandPalette';
import { getPlatformShortcut } from '@/lib/utils';

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

  const handleNewDraft = () => router.push('/editor');

  const handleSchedule = () => router.push('/scheduler');

  const handleConnect = () => router.push('/integrations');

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

  const notifications = [
    {
      id: '1',
      title: 'Post published successfully',
      message:
        'Your article "Getting Started with Next.js 15" was published to Medium',
      time: '2 minutes ago',
      type: 'success',
    },
    {
      id: '2',
      title: 'Scheduled post reminder',
      message: 'You have 3 posts scheduled for this week',
      time: '1 hour ago',
      type: 'info',
    },
    {
      id: '3',
      title: 'Integration connected',
      message: 'Dev.to account connected successfully',
      time: '2 hours ago',
      type: 'success',
    },
  ];

  const allNotifications = [
    ...notifications,
    {
      id: '4',
      title: 'Weekly report ready',
      message: 'Your weekly content performance report is now available',
      time: '1 day ago',
      type: 'info',
    },
    {
      id: '5',
      title: 'New feature available',
      message: 'AI thumbnail generation is now available for Pro users',
      time: '2 days ago',
      type: 'success',
    },
    {
      id: '6',
      title: 'Account updated',
      message: 'Your profile information has been successfully updated',
      time: '3 days ago',
      type: 'success',
    },
  ];

  const onToggleAllNotifications = () => setShowAllNotifications(false);

  const onToggleNotifications = () => setShowNotifications(prev => !prev);

  const onToggleUserMenu = () => setShowUserMenu(prev => !prev);

  return (
    <>
      <div className='h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-6'>
        {/* Search */}
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

        {/* Quick Actions */}
        <div className='flex items-center space-x-2 ml-4'>
          <button onClick={handleNewDraft} className='btn btn-primary btn-sm'>
            <Plus size={16} className='mr-2' />
            New Draft
          </button>
          <button onClick={handleSchedule} className='btn btn-ghost btn-sm'>
            <Calendar size={16} className='mr-2' />
            Schedule
          </button>
          <button onClick={handleConnect} className='btn btn-ghost btn-sm'>
            <Zap size={16} className='mr-2' />
            Connect
          </button>
        </div>

        {/* User Menu */}
        <div className='flex items-center space-x-3 ml-4'>
          {/* Notifications */}
          <div className='relative' ref={notificationRef}>
            <button
              onClick={onToggleNotifications}
              className='btn btn-ghost btn-sm btn-circle relative'
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className='absolute -top-1 -right-1 w-4 h-4 bg-error text-error-content text-xs rounded-full flex items-center justify-center'>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className='absolute right-0 mt-2 w-80 bg-base-200 rounded-lg shadow-lg border border-base-300 py-1 z-50 max-h-96 overflow-y-auto'>
                <div className='px-4 py-2 border-b border-base-300'>
                  <p className='text-sm font-medium'>Notifications</p>
                </div>
                {notifications.length === 0 ? (
                  <div className='px-4 py-6 text-center text-sm text-base-content/50'>
                    No notifications
                  </div>
                ) : (
                  <div className='space-y-1'>
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className='px-4 py-3 hover:bg-base-300 cursor-pointer'
                      >
                        <div className='flex items-start space-x-3'>
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notification.type === 'success'
                                ? 'bg-success'
                                : 'bg-info'
                            }`}
                          ></div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium'>
                              {notification.title}
                            </p>
                            <p className='text-xs text-base-content/70 mt-1'>
                              {notification.message}
                            </p>
                            <p className='text-xs text-base-content/50 mt-1'>
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className='border-t border-base-300 mt-1'>
                  <button
                    onClick={handleViewAllNotifications}
                    className='w-full text-left px-4 py-2 text-sm hover:bg-base-300 text-primary'
                  >
                    View all notifications
                  </button>
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

      {/* All Notifications Modal */}
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
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {allNotifications.map(notification => (
                <div
                  key={notification.id}
                  className='p-4 border border-base-300 rounded-lg hover:bg-base-100 transition-colors'
                >
                  <div className='flex items-start space-x-3'>
                    <div
                      className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        notification.type === 'success'
                          ? 'bg-success'
                          : 'bg-info'
                      }`}
                    ></div>
                    <div className='flex-1'>
                      <p className='font-medium'>{notification.title}</p>
                      <p className='text-sm text-base-content/70 mt-1'>
                        {notification.message}
                      </p>
                      <p className='text-xs text-base-content/50 mt-2'>
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
