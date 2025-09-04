'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { ShortcutsProvider } from './ShortcutsProvider';
import PlanInitializer from './PlanInitializer';

type RootLayoutWrapperProps = {
  children: React.ReactNode;
};

export function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <PlanInitializer />
      <div className='flex h-screen bg-base-100'>
        <AppSidebar />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Topbar />
          <main className='flex-1 overflow-auto'>{children}</main>
        </div>
      </div>
      <ShortcutsProvider />
    </>
  );
}
