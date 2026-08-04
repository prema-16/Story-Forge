'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action, className, ...props }: EmptyStateProps) => (
  <div
    className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}
    {...props}
  >
    {icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white/20">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-white/70 mb-1">{title}</h3>
    {description && <p className="text-sm text-white/40 max-w-sm mb-6">{description}</p>}
    {action && (
      <Button variant="secondary" size="md" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);
