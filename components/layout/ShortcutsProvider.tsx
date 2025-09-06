'use client';

import { useShortcuts } from '@/hooks/use-shortcuts';

export function ShortcutsProvider() {
  useShortcuts();
  return null;
}
