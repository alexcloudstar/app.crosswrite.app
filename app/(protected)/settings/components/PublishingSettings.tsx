'use client';

import { Send } from 'lucide-react';

export function PublishingSettings() {
  return (
    <div className='text-center py-12'>
      <div className='inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6'>
        <Send className='w-8 h-8 text-primary' />
      </div>
      <h2 className='text-2xl font-bold mb-4'>
        Publishing Settings Coming Soon!
      </h2>
      <p className='text-lg text-base-content/70 max-w-md mx-auto'>
        We&apos;re working on advanced publishing preferences including default
        publish times, auto-scheduling, and platform-specific settings.
      </p>
    </div>
  );
}
