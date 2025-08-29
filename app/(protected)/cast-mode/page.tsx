import {
  Mic,
  Music,
  Clock,
  Scissors,
  FileText,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export default function CastModePage() {
  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='text-center mb-12'>
        <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6'>
          <Mic size={40} className='text-primary' />
        </div>
        <h1 className='text-4xl font-bold mb-4'>Cast Mode</h1>
        <p className='text-xl text-base-content/70 mb-8'>
          Turn your articles into podcasts and shorts automatically
        </p>
        <div className='badge badge-primary badge-lg'>Coming Soon</div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <Mic size={24} className='text-blue-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Natural voices
            </h3>
            <p className='text-base-content/70'>
              High-quality AI voices that sound human and engaging
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <Music size={24} className='text-green-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Background music + ducking
            </h3>
            <p className='text-base-content/70'>
              Professional background tracks with automatic audio ducking
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <Clock size={24} className='text-purple-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Chapters + timestamps
            </h3>
            <p className='text-base-content/70'>
              Automatic chapter markers and timestamp generation
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <Scissors size={24} className='text-orange-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Filler cleanup + pacing
            </h3>
            <p className='text-base-content/70'>
              Remove filler words and optimize speech pacing automatically
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <FileText size={24} className='text-teal-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Captions (SRT/VTT)
            </h3>
            <p className='text-base-content/70'>
              Generate accurate captions in multiple formats
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-sm'>
          <div className='card-body text-center'>
            <div className='w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
              <Download size={24} className='text-pink-500' />
            </div>
            <h3 className='card-title text-lg justify-center'>
              Exports: MP3/WAV + 1080×1920 audiogram
            </h3>
            <p className='text-base-content/70'>
              High-quality audio files and TikTok-ready video exports
            </p>
          </div>
        </div>
      </div>

      <div className='text-center'>
        <p className='text-base-content/70 mb-6'>
          Soon, Cross Write will let you convert any article into a podcast or
          TikTok-ready audiogram. Natural voices, background music, and captions
          included.
        </p>
        <Link href='/updates' className='btn btn-primary'>
          Stay Updated
        </Link>
      </div>
    </div>
  );
}
