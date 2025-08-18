'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Edit3,
  FileText,
  Calendar,
  Zap,
  BarChart3,
  Settings,
  Plus,
  X,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getPlatformShortcut } from '@/lib/utils';

const commands = [
  {
    id: 'new-draft',
    name: 'New Draft',
    description: 'Create a new draft',
    icon: Plus,
    action: () => ({ type: 'navigate', path: '/editor' }),
    shortcut: 'N',
  },
  {
    id: 'open-editor',
    name: 'Open Editor',
    description: 'Go to the editor',
    icon: Edit3,
    action: () => ({ type: 'navigate', path: '/editor' }),
    shortcut: getPlatformShortcut('E'),
  },
  {
    id: 'open-drafts',
    name: 'Open Drafts',
    description: 'View all drafts',
    icon: FileText,
    action: () => ({ type: 'navigate', path: '/drafts' }),
    shortcut: getPlatformShortcut('D'),
  },
  {
    id: 'open-scheduler',
    name: 'Open Scheduler',
    description: 'Schedule posts',
    icon: Calendar,
    action: () => ({ type: 'navigate', path: '/scheduler' }),
    shortcut: getPlatformShortcut('S'),
  },
  {
    id: 'open-integrations',
    name: 'Open Integrations',
    description: 'Manage platform connections',
    icon: Zap,
    action: () => ({ type: 'navigate', path: '/integrations' }),
    shortcut: getPlatformShortcut('I'),
  },
  {
    id: 'open-analytics',
    name: 'Open Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    action: () => ({ type: 'navigate', path: '/analytics' }),
    shortcut: getPlatformShortcut('A'),
  },
  {
    id: 'open-settings',
    name: 'Open Settings',
    description: 'Configure your preferences',
    icon: Settings,
    action: () => ({ type: 'navigate', path: '/settings' }),
    shortcut: getPlatformShortcut(','),
  },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, closeCommandPalette } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter(
    command =>
      command.name.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase())
  );

  const scrollSelectedIntoView = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const items = container.querySelectorAll('button');
      const selectedItem = items[index];

      if (selectedItem) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = selectedItem.getBoundingClientRect();

        if (itemRect.top < containerRect.top) {
          selectedItem.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } else if (itemRect.bottom > containerRect.bottom) {
          selectedItem.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeCommandPalette();
      }
    }

    if (commandPaletteOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [commandPaletteOpen, closeCommandPalette]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!commandPaletteOpen) return;

      switch (event.key) {
        case 'Escape':
          closeCommandPalette();
          break;
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex =
            selectedIndex < filteredCommands.length - 1 ? selectedIndex + 1 : 0;
          setSelectedIndex(nextIndex);
          scrollSelectedIntoView(nextIndex);
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex =
            selectedIndex > 0 ? selectedIndex - 1 : filteredCommands.length - 1;
          setSelectedIndex(prevIndex);
          scrollSelectedIntoView(prevIndex);
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            const result = filteredCommands[selectedIndex].action();
            if (result.type === 'navigate') {
              router.push(result.path);
            }
            closeCommandPalette();
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    commandPaletteOpen,
    filteredCommands,
    selectedIndex,
    router,
    closeCommandPalette,
  ]);

  const handleCommandClick = (command: (typeof commands)[number]) => {
    const result = command.action();
    if (result.type === 'navigate') {
      router.push(result.path);
    }

    closeCommandPalette();
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className='modal modal-open'>
      <div className='modal-box max-w-2xl p-0' ref={modalRef}>
        <div className='p-4 border-b border-base-300'>
          <div className='flex items-center space-x-3'>
            <Search size={20} className='text-base-content/50' />
            <input
              ref={inputRef}
              type='text'
              placeholder='Search commands...'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className='flex-1 bg-transparent border-none outline-none text-lg'
              autoFocus
            />
            <button
              onClick={closeCommandPalette}
              className='btn btn-ghost btn-sm btn-circle'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className='max-h-96 overflow-y-auto' ref={scrollContainerRef}>
          {filteredCommands.length === 0 ? (
            <div className='p-8 text-center text-base-content/50'>
              <p>No commands found</p>
            </div>
          ) : (
            <div className='py-2'>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={handleCommandClick.bind(null, command)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left hover:bg-base-200 transition-colors
                    ${index === selectedIndex ? 'bg-base-200' : ''}
                  `}
                >
                  <command.icon
                    size={20}
                    className='mr-3 text-base-content/70'
                  />
                  <div className='flex-1'>
                    <div className='font-medium'>{command.name}</div>
                    <div className='text-sm text-base-content/50'>
                      {command.description}
                    </div>
                  </div>
                  <kbd className='kbd kbd-sm'>{command.shortcut}</kbd>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='p-4 border-t border-base-300 text-xs text-base-content/50'>
          <div className='flex justify-between'>
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>
              {filteredCommands.length} command
              {filteredCommands.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
