'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          border: '1px solid hsl(var(--b3))',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
        },
        success: {
          iconTheme: {
            primary: 'hsl(var(--su))',
            secondary: 'hsl(var(--b1))',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(var(--er))',
            secondary: 'hsl(var(--b1))',
          },
        },
        loading: {
          iconTheme: {
            primary: 'hsl(var(--p))',
            secondary: 'hsl(var(--b1))',
          },
        },
      }}
    />
  );
}
