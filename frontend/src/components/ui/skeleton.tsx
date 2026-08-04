'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('shimmer-loading rounded-xl', className)} {...props} />
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('glass rounded-2xl p-5 space-y-3', className)}>
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonStat = () => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-start justify-between mb-3">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <Skeleton className="h-7 w-24 mb-1" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass">
        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
