'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeMap = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

export const Spinner = ({ size = 'md', className, ...props }: SpinnerProps) => (
  <div
    role="status"
    className={cn('relative flex items-center justify-center', sizeMap[size], className)}
    {...props}
  >
    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
  </div>
);

export const FullPageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#05050f]">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-white/40">Loading StoryForge AI...</p>
    </div>
  </div>
);
