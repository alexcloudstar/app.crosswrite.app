'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Edit3,
  FileText,
  Calendar,
  Zap,
  BarChart3,
  Mic,
  Settings,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Logo from '@/public/logo.png';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Editor', href: '/editor', icon: Edit3 },
  { name: 'Drafts', href: '/drafts', icon: FileText },
  { name: 'Scheduler', href: '/scheduler', icon: Calendar },
  { name: 'Integrations', href: '/integrations', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Cast Mode', href: '/cast-mode', icon: Mic },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [showHelp, setShowHelp] = useState(false);

  const toggleShowHelp = () => setShowHelp(prev => !prev);

  return (
    <>
      <div
        className={cn(
          'flex flex-col h-screen bg-base-200 border-r border-base-300 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className='flex items-center justify-between p-4 border-b border-base-300'>
          {!sidebarCollapsed && (
            <Link href='/' className='flex items-center space-x-2'>
              <Image src={Logo} alt='Cross Write' width={32} height={32} />
              <span className='font-semibold text-lg'>Cross Write</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto'>
              <span className='text-primary-content font-bold text-sm'>CW</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className='btn btn-ghost btn-sm p-1'
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        <nav className='flex-1 p-2 space-y-1'>
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-base-300 hover:text-base-content',
                  isActive
                    ? 'bg-primary text-primary-content'
                    : 'text-base-content/70'
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon size={20} className='flex-shrink-0' />
                {!sidebarCollapsed && <span className='ml-3'>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className='p-2 border-t border-base-300 space-y-1'>
          <button
            onClick={toggleShowHelp}
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium',
              'text-base-content/70 hover:bg-base-300 hover:text-base-content transition-colors'
            )}
            title={sidebarCollapsed ? 'Help' : undefined}
          >
            <HelpCircle size={20} className='flex-shrink-0' />
            {!sidebarCollapsed && <span className='ml-3'>Help</span>}
          </button>

          <Link
            href='/settings'
            className={cn(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium',
              'text-base-content/70 hover:bg-base-300 hover:text-base-content transition-colors'
            )}
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <User size={20} className='flex-shrink-0' />
            {!sidebarCollapsed && (
              <>
                <span className='ml-3'>{session?.user?.name || 'User'}</span>
                <div className='ml-auto w-2 h-2 bg-success rounded-full'></div>
              </>
            )}
          </Link>
        </div>
      </div>

      {showHelp && (
        <div className='modal modal-open'>
          <div className='modal-box max-w-md'>
            <h3 className='font-bold text-lg mb-4'>Keyboard Shortcuts</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>New Draft</span>
                <kbd className='kbd kbd-sm'>N</kbd>
              </div>
              <div className='flex justify-between'>
                <span>Command Palette</span>
                <kbd className='kbd kbd-sm'>⌘K</kbd>
              </div>
              <div className='flex justify-between'>
                <span>Save Draft</span>
                <kbd className='kbd kbd-sm'>⌘S</kbd>
              </div>
              <div className='flex justify-between'>
                <span>Go to Dashboard</span>
                <kbd className='kbd kbd-sm'>⌘D</kbd>
              </div>
              <div className='flex justify-between'>
                <span>Go to Editor</span>
                <kbd className='kbd kbd-sm'>⌘E</kbd>
              </div>
              <div className='flex justify-between'>
                <span>Toggle Sidebar</span>
                <kbd className='kbd kbd-sm'>⌘B</kbd>
              </div>
            </div>
            <div className='modal-action'>
              <button className='btn btn-primary' onClick={toggleShowHelp}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
