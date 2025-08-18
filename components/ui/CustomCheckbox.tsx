'use client';

import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  [key: string]: unknown;
}

export function CustomCheckbox({
  checked = false,
  onChange,
  children,
  size = 'md',
  className = '',
  ...props
}: CustomCheckboxProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const iconSize = {
    sm: 10,
    md: 12,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange?.(e.target.checked);

  return (
    <label
      className={`flex items-center space-x-3 cursor-pointer group ${className}`}
    >
      <div className='relative'>
        <input
          type='checkbox'
          checked={checked}
          onChange={handleChange}
          className='sr-only'
          {...props}
        />
        <div
          className={`
          ${
            sizeClasses[size]
          } border-2 rounded transition-all duration-200 flex items-center justify-center
          ${
            checked
              ? 'bg-primary border-primary'
              : 'border-base-300 bg-base-100 group-hover:border-primary/50'
          }
        `}
        >
          {checked && <Check size={iconSize[size]} className='text-white' />}
        </div>
      </div>
      {children && (
        <span className='text-sm text-base-content'>{children}</span>
      )}
    </label>
  );
}
