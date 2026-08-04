'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name?: string): string {
  const colors = [
    'from-purple-600 to-purple-400',
    'from-pink-600 to-pink-400',
    'from-cyan-600 to-cyan-400',
    'from-emerald-600 to-emerald-400',
    'from-amber-600 to-amber-400',
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export const Avatar = ({ src, alt, name, size = 'md', className, ...props }: AvatarProps) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-semibold',
        sizeMap[size],
        !src || imgError
          ? `bg-gradient-to-br ${getColor(name)} text-white`
          : 'bg-white/5',
        className
      )}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt ?? name ?? 'avatar'}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
