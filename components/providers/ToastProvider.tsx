'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position='top-right'
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow:
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '400px',
          minWidth: '300px',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
          iconTheme: {
            primary: '#16a34a',
            secondary: '#f0fdf4',
          },
        },
        error: {
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fef2f2',
          },
        },
        loading: {
          style: {
            background: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #bfdbfe',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#eff6ff',
          },
        },
      }}
    />
  );
}
