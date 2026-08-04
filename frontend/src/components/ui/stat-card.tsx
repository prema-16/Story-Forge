'use client';
import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'purple' | 'green' | 'amber' | 'cyan' | 'pink' | 'red';
  change?: number;
  changeLabel?: string;
  suffix?: string;
}

const colorMap = {
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/15',
    icon: 'text-purple-400',
    text: 'text-purple-300',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/15',
    icon: 'text-emerald-400',
    text: 'text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/15',
    icon: 'text-amber-400',
    text: 'text-amber-300',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/15',
    icon: 'text-cyan-400',
    text: 'text-cyan-300',
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/15',
    icon: 'text-pink-400',
    text: 'text-pink-300',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/15',
    icon: 'text-red-400',
    text: 'text-red-300',
  },
};

export const StatCard = ({
  label,
  value,
  icon,
  color = 'purple',
  change,
  changeLabel,
  suffix,
  className,
  ...props
}: StatCardProps) => {
  const c = colorMap[color];
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        'glass rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-200 cursor-default',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', c.bg, c.border)}>
          <span className={cn('h-5 w-5', c.icon)}>{icon}</span>
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="font-display text-2xl font-bold text-white mb-1">
        {value}
        {suffix && <span className="text-base text-white/40 ml-1">{suffix}</span>}
      </div>
      <div className="text-sm text-white/50">{label}</div>
      {changeLabel && (
        <div className="text-xs text-white/30 mt-1">{changeLabel}</div>
      )}
    </div>
  );
};
