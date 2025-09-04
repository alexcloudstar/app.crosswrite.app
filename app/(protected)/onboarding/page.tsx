'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Zap,
  Edit3,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    platforms: [] as string[],
    tone: 'professional',
    tags: '',
  });
  const [autoGenerateUrls, setAutoGenerateUrls] = useState(true);
  const [includeReadingTime, setIncludeReadingTime] = useState(true);

  const steps = [
    {
      id: 1,
      title: 'Your Profile',
      description: 'Tell us about yourself',
      icon: User,
    },
    {
      id: 2,
      title: 'Choose Platforms',
      description: 'Select where you want to publish',
      icon: Zap,
    },
    {
      id: 3,
      title: 'Writing Defaults',
      description: 'Set your preferences',
      icon: Edit3,
    },
  ];

  const platforms = [
    {
      id: 'devto',
      name: 'dev.to',
      description: 'Developer community platform',
      icon: 'DEV',
      color: 'bg-blue-500',
    },
    {
      id: 'hashnode',
      name: 'Hashnode',
      description: 'Developer-focused blogging',
      icon: 'H',
      color: 'bg-purple-500',
    },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const updateFormData =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.handle.trim();
      case 2:
        return formData.platforms.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className='min-h-screen bg-base-100 flex items-center justify-center p-6'>
      <div className='w-full max-w-2xl'>
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className='flex items-center'>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? 'bg-success border-success text-success-content'
                        : isActive
                          ? 'bg-primary border-primary text-primary-content'
                          : 'border-base-300 text-base-content/50'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        isCompleted ? 'bg-success' : 'bg-base-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-2'>
              {steps[currentStep - 1].title}
            </h2>
            <p className='text-base-content/70'>
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        <div className='card bg-base-100 border border-base-300 shadow-lg'>
          <div className='card-body'>
            {currentStep === 1 && (
              <div className='space-y-6'>
                <div>
                  <label className='label'>
                    <span className='label-text'>Full Name</span>
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={updateFormData.bind(null, 'name')}
                    placeholder='Enter your full name'
                    className='input input-bordered w-full'
                  />
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text'>Handle/Username</span>
                  </label>
                  <input
                    type='text'
                    value={formData.handle}
                    onChange={updateFormData('handle')}
                    placeholder='Choose a unique handle'
                    className='input input-bordered w-full'
                  />
                  <label className='label'>
                    <span className='label-text-alt'>
                      This will be used across platforms
                    </span>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className='space-y-4'>
                <p className='text-base-content/70 mb-4'>
                  Select the platforms where you want to publish your content:
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {platforms.map(platform => (
                    <div
                      key={platform.id}
                      onClick={handlePlatformToggle.bind(null, platform.id)}
                      className={`card border-2 cursor-pointer transition-all ${
                        formData.platforms.includes(platform.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-base-300 hover:border-base-400'
                      }`}
                    >
                      <div className='card-body p-4'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}
                          >
                            {platform.icon}
                          </div>
                          <div>
                            <h3 className='font-semibold'>{platform.name}</h3>
                            <p className='text-sm text-base-content/50'>
                              {platform.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className='space-y-6'>
                <div>
                  <label className='label'>
                    <span className='label-text'>Preferred Writing Tone</span>
                  </label>
                  <select
                    value={formData.tone}
                    onChange={updateFormData.bind(null, 'tone')}
                    className='select select-bordered w-full'
                  >
                    <option value='professional'>Professional</option>
                    <option value='casual'>Casual</option>
                    <option value='friendly'>Friendly</option>
                    <option value='academic'>Academic</option>
                  </select>
                </div>
                <div>
                  <label className='label'>
                    <span className='label-text'>Default Tags</span>
                  </label>
                  <input
                    type='text'
                    value={formData.tags}
                    onChange={updateFormData.bind(null, 'tags')}
                    placeholder='javascript, react, web-development'
                    className='input input-bordered w-full'
                  />
                  <label className='label'>
                    <span className='label-text-alt'>
                      Separate tags with commas
                    </span>
                  </label>
                </div>
                <div className='flex items-center space-x-2'>
                  <CustomCheckbox
                    checked={autoGenerateUrls}
                    onChange={setAutoGenerateUrls}
                  >
                    Auto-generate canonical URLs
                  </CustomCheckbox>
                </div>
                <div className='flex items-center space-x-2'>
                  <CustomCheckbox
                    checked={includeReadingTime}
                    onChange={setIncludeReadingTime}
                  >
                    Include reading time estimates
                  </CustomCheckbox>
                </div>
              </div>
            )}

            <div className='flex items-center justify-between pt-6'>
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className='btn btn-ghost'
              >
                <ChevronLeft size={16} className='mr-2' />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className='btn btn-primary'
              >
                {currentStep === 3 ? (
                  <>
                    Finish & Go to Dashboard
                    <ChevronRight size={16} className='ml-2' />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={16} className='ml-2' />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
