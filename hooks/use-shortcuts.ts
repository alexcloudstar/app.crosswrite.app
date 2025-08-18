'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export function useShortcuts() {
  const router = useRouter();
  const { openCommandPalette, toggleSidebar } = useAppStore();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        console.log('Command palette shortcut triggered');
        openCommandPalette();
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'a':
            event.preventDefault();
            console.log('Go to analytics shortcut triggered');
            router.push('/analytics');
            return;
          case 'd':
            event.preventDefault();
            console.log('Go to drafts shortcut triggered');
            router.push('/drafts');
            return;
          case 'e':
            event.preventDefault();
            console.log('Go to editor shortcut triggered');
            router.push('/editor');
            return;
          case 's':
            event.preventDefault();
            console.log('Save draft shortcut triggered');

            console.log('Save draft');
            return;
          case 'b':
            event.preventDefault();
            console.log('Toggle sidebar shortcut triggered');
            toggleSidebar();
            return;
          case 'i':
            event.preventDefault();
            console.log('Go to integrations shortcut triggered');
            router.push('/integrations');
            return;
          case 'h':
            event.preventDefault();
            console.log('Go to dashboard shortcut triggered');
            router.push('/');
            return;
        }
      }

      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            console.log('New draft shortcut triggered');
            router.push('/editor');
            return;
          case 'g':
            event.preventDefault();
            console.log('Go to drafts shortcut triggered');
            router.push('/drafts');
            return;
          case '1':
            event.preventDefault();
            console.log('Go to dashboard shortcut triggered');
            router.push('/');
            return;
          case '2':
            event.preventDefault();
            console.log('Go to editor shortcut triggered');
            router.push('/editor');
            return;
          case '3':
            event.preventDefault();
            console.log('Go to drafts shortcut triggered');
            router.push('/drafts');
            return;
          case '4':
            event.preventDefault();
            console.log('Go to scheduler shortcut triggered');
            router.push('/scheduler');
            return;
          case '5':
            event.preventDefault();
            console.log('Go to integrations shortcut triggered');
            router.push('/integrations');
            return;
          case '6':
            event.preventDefault();
            console.log('Go to analytics shortcut triggered');
            router.push('/analytics');
            return;
          case '7':
            event.preventDefault();
            console.log('Go to settings shortcut triggered');
            router.push('/settings');
            return;
        }
      }

      if (event.shiftKey && event.key === 'G') {
        event.preventDefault();
        console.log('Go to drafts shortcut triggered (Shift+G)');
        router.push('/drafts');
        return;
      }
    }

    console.log('Shortcuts hook initialized');
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('Shortcuts hook cleanup');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, openCommandPalette, toggleSidebar]);
}
