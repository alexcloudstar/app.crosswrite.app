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
        openCommandPalette();
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'a':
            event.preventDefault();
            router.push('/analytics');
            return;
          case 'd':
            event.preventDefault();
            router.push('/drafts');
            return;
          case 'e':
            event.preventDefault();
            router.push('/editor');
            return;
          case 's':
            event.preventDefault();
            return;
          case 'b':
            event.preventDefault();
            toggleSidebar();
            return;
          case 'i':
            event.preventDefault();
            router.push('/integrations');
            return;
          case 'h':
            event.preventDefault();
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
            router.push('/editor');
            return;
          case 'g':
            event.preventDefault();
            router.push('/drafts');
            return;
          case '1':
            event.preventDefault();
            router.push('/');
            return;
          case '2':
            event.preventDefault();
            router.push('/editor');
            return;
          case '3':
            event.preventDefault();
            router.push('/drafts');
            return;
          case '4':
            event.preventDefault();
            router.push('/scheduler');
            return;
          case '5':
            event.preventDefault();
            router.push('/integrations');
            return;
          case '6':
            event.preventDefault();
            router.push('/analytics');
            return;
        }
      }

      if (event.shiftKey && event.key === 'G') {
        event.preventDefault();
        router.push('/drafts');
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, openCommandPalette, toggleSidebar]);
}
