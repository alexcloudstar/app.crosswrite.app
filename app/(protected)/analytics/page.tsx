import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='text-center mb-12'>
        <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6'>
          <BarChart3 size={40} className='text-primary' />
        </div>
        <h1 className='text-4xl font-bold mb-4'>Analytics Dashboard</h1>
        <p className='text-xl text-base-content/70 mb-8'>
          Track your content performance across all platforms
        </p>
        <div className='badge badge-primary badge-lg'>Coming Soon</div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <Eye size={24} className='text-blue-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Read Analytics
            </h3>
            <p className='text-base-content/70'>
              Track views, reads, and engagement metrics
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <TrendingUp size={24} className='text-green-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Performance Insights
            </h3>
            <p className='text-base-content/70'>
              Analyze what content performs best
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <Users size={24} className='text-purple-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Audience Insights
            </h3>
            <p className='text-base-content/70'>
              Understand your audience better
            </p>
          </div>
        </div>
      </div>

      <div className='text-center'>
        <p className='text-base-content/70 mb-6'>
          We&apos;re working hard to bring you powerful analytics. Be the first
          to know when it&apos;s ready!
        </p>
        <Link href='/updates' className='btn btn-primary'>
          Stay Updated
        </Link>
      </div>
    </div>
  );
}
