import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { RootLayoutWrapper } from '@/components/layout/RootLayoutWrapper';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { SentryProvider } from '@sentry/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cross Write - Multi-platform Writing & Publishing',
  description:
    'Write once, publish everywhere. Cross Write helps you create and publish content across multiple platforms.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' data-theme='peachsorbet'>
      <body className={inter.className}>
        <SentryProvider>
          <SessionProvider>
            <RootLayoutWrapper>{children}</RootLayoutWrapper>
            <ToastProvider />
          </SessionProvider>
        </SentryProvider>
      </body>
    </html>
  );
}
