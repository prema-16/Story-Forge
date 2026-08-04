'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, autoResize = false, id, onChange, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && combinedRef.current) {
        combinedRef.current.style.height = 'auto';
        combinedRef.current.style.height = `${combinedRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white/70">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={combinedRef}
          onChange={handleChange}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none',
            'transition-all duration-200',
            'focus:outline-none focus:border-purple-500/50 focus:bg-white/7 focus:ring-1 focus:ring-purple-500/30',
            'hover:border-white/20',
            error && 'border-red-500/50 focus:border-red-500/70',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
