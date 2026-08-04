'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5 border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/5 border-white/10 text-white/70',
        pending: 'bg-white/5 border-white/10 text-white/40',
        running: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
        completed: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
        failed: 'bg-red-500/10 border-red-500/25 text-red-400',
        skipped: 'bg-slate-500/10 border-slate-500/25 text-slate-500',
        draft: 'bg-white/5 border-white/10 text-white/40',
        generating: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
        review: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
        archived: 'bg-slate-500/10 border-slate-500/20 text-slate-500',
        purple: 'bg-purple-500/10 border-purple-500/25 text-purple-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400',
        pink: 'bg-pink-500/10 border-pink-500/25 text-pink-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge = ({ className, variant, dot, children, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props}>
    {dot && (
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'running' || variant === 'generating' ? 'bg-amber-400 animate-pulse' : '',
          variant === 'completed' ? 'bg-emerald-400' : '',
          variant === 'failed' ? 'bg-red-400' : '',
          variant === 'pending' || variant === 'draft' ? 'bg-white/30' : '',
        )}
      />
    )}
    {children}
  </span>
);
