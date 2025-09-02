'use client';

import { Clock, Calendar, Zap, Users, BarChart3 } from 'lucide-react';

export default function SchedulerPage() {
  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='text-center mb-12'>
        <div className='flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 mx-auto'>
          <Calendar className='w-10 h-10 text-primary' />
        </div>
        <h1 className='text-4xl font-bold mb-4'>Content Scheduler</h1>
        <p className='text-xl text-base-content/70 max-w-2xl mx-auto'>
          Automatically publish your content at the perfect time across all your
          platforms. Schedule once, publish everywhere.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
        <div className='card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow'>
          <div className='card-body text-center'>
            <div className='flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto'>
              <Clock className='w-6 h-6 text-primary' />
            </div>
            <h3 className='font-semibold mb-2'>Smart Scheduling</h3>
            <p className='text-sm text-base-content/70'>
              AI-powered timing recommendations for maximum engagement
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow'>
          <div className='card-body text-center'>
            <div className='flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mb-4 mx-auto'>
              <Zap className='w-6 h-6 text-secondary' />
            </div>
            <h3 className='font-semibold mb-2'>Cross-Platform Publishing</h3>
            <p className='text-sm text-base-content/70'>
              Schedule once, publish to Dev.to, Hashnode, and more
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow'>
          <div className='card-body text-center'>
            <div className='flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4 mx-auto'>
              <BarChart3 className='w-6 h-6 text-accent' />
            </div>
            <h3 className='font-semibold mb-2'>Analytics & Insights</h3>
            <p className='text-sm text-base-content/70'>
              Track performance and optimize your publishing strategy
            </p>
          </div>
        </div>
      </div>

      <div className='card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-lg'>
        <div className='card-body text-center'>
          <div className='flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6 mx-auto'>
            <Users className='w-8 h-8 text-primary' />
          </div>
          <h2 className='text-2xl font-bold mb-4'>Coming Soon!</h2>
          <p className='text-lg text-base-content/70 mb-6 max-w-xl mx-auto'>
            We're working hard to bring you the most powerful content scheduling
            tool. Get ready to revolutionize how you publish content across the
            web.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <div className='badge badge-primary badge-lg px-4 py-3'>
              <Clock className='w-4 h-4 mr-2' />
              Smart Timing
            </div>
            <div className='badge badge-secondary badge-lg px-4 py-3'>
              <Zap className='w-4 h-4 mr-2' />
              Auto-Publish
            </div>
            <div className='badge badge-accent badge-lg px-4 py-3'>
              <BarChart3 className='w-4 h-4 mr-2' />
              Analytics
            </div>
          </div>
        </div>
      </div>

      <div className='text-center mt-12'>
        <p className='text-base-content/50 text-sm'>
          Want to be notified when the scheduler launches?
          <span className='text-primary font-medium ml-1'>
            Notifications coming soon!
          </span>
        </p>
      </div>
    </div>
  );
}
