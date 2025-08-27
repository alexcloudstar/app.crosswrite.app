import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPlatformDisplayName as getPlatformDisplayNameFromConfig, getPlatformColor as getPlatformColorFromConfig, Platform } from '@/lib/config/platforms';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPlatformShortcut(key: string): string {
  const isMac =
    typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');
  const modifier = isMac ? '⌘' : 'Ctrl';
  return `${modifier}${key}`;
}

export function isModifierKey(event: KeyboardEvent): boolean {
  const isMac =
    typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');
  return isMac ? event.metaKey : event.ctrlKey;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}

export function getPlatformDisplayName(platform: string): string {
  return getPlatformDisplayNameFromConfig(platform as Platform) || platform;
}

export function getPlatformColor(platform: string): string {
  return getPlatformColorFromConfig(platform as Platform) || 'bg-gray-500';
}
