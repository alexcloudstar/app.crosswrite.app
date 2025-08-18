import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ShortcutsProvider } from '@/components/layout/ShortcutsProvider';

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
        <div className='flex h-screen bg-base-100'>
          <AppSidebar />
          <div className='flex-1 flex flex-col overflow-hidden'>
            <Topbar />
            <main className='flex-1 overflow-auto'>{children}</main>
          </div>
        </div>
        <ShortcutsProvider />
      </body>
    </html>
  );
}
