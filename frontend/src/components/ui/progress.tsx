'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: 'purple' | 'green' | 'amber' | 'red' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
}

const colorMap = {
  purple: 'from-purple-600 to-purple-400',
  green: 'from-emerald-500 to-emerald-400',
  amber: 'from-amber-500 to-amber-400',
  red: 'from-red-500 to-red-400',
  cyan: 'from-cyan-500 to-cyan-400',
};

const sizeMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress = ({
  value,
  max = 100,
  color = 'purple',
  size = 'md',
  animated = false,
  showLabel = false,
  className,
  ...props
}: ProgressProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <div className={cn('flex-1 overflow-hidden rounded-full bg-white/5', sizeMap[size])}>
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out',
            colorMap[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-valuemin={0}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-white/40 tabular-nums w-9 text-right">{Math.round(pct)}%</span>
      )}
    </div>
  );
};
