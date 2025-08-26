'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  const handleSignOut = async () =>
    await signOut({ redirectTo: '/auth/sign-in' });

  return (
    <button
      onClick={handleSignOut}
      className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
    >
      Sign Out
    </button>
  );
}
