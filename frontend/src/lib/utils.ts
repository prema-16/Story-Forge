import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export shared utilities and constants from @storyforge/shared
export {
  formatNumber,
  formatDuration,
  formatBytes,
  truncate,
  debounce,
  sleep,
  GENRES,
  VIDEO_STYLES,
  ASPECT_RATIOS,
  STATUS_COLORS,
  STEP_LABELS,
} from '@storyforge/shared';
