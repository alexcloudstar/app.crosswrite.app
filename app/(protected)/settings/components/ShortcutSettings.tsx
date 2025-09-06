'use client';

import { Trash2 } from 'lucide-react';

export function ShortcutSettings() {
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
