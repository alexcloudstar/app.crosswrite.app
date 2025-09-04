import { Plus } from 'lucide-react';
import Link from 'next/link';

export function DraftsHeader() {
  return (
    <div className='flex items-center justify-between mb-8'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>Drafts</h1>
        <p className='text-base-content/70'>
          Manage your content drafts and published posts
        </p>
      </div>
      <Link href='/editor' className='btn btn-primary'>
        <Plus size={16} className='mr-2' />
        New Draft
      </Link>
    </div>
  );
}
