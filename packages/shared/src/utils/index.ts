/**
 * @storyforge/shared — Utilities
 *
 * Pure utility functions usable in both Node.js and browser environments.
 * No external dependencies.
 */

// ─── Number Formatting ────────────────────────────────────────────────────────

/**
 * Format a large number to a human-readable abbreviation.
 * @example formatNumber(1234567) → "1.2M"
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Duration Formatting ──────────────────────────────────────────────────────

/**
 * Format seconds to MM:SS display.
 * @example formatDuration(125) → "2:05"
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format seconds to a human-readable string.
 * @example formatDurationHuman(3661) → "1h 1m"
 */
export function formatDurationHuman(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Byte Formatting ──────────────────────────────────────────────────────────

/**
 * Format bytes to a human-readable file size string.
 * @example formatBytes(1536) → "1.5 KB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── String Utilities ─────────────────────────────────────────────────────────

/**
 * Truncate a string to a max length, appending "..." if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Parse a browser User-Agent string to a friendly display name.
 */
export function truncateUserAgent(ua: string): string {
  if (ua.length < 60) return ua;
  const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
  return match ? `${match[0]} — ${ua.slice(0, 30)}...` : ua.slice(0, 60) + '...';
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a camelCase or snake_case string to Title Case with spaces.
 * @example toTitleCase('ai-writer') → "Ai Writer"
 */
export function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(capitalize)
    .join(' ');
}

// ─── Date / Time Utilities ────────────────────────────────────────────────────

/**
 * Format an ISO8601 timestamp as a relative time string.
 * @example formatRelative("2026-07-31T10:00:00Z") → "2h ago"
 */
export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

/**
 * Format an ISO8601 date as a short locale date string.
 * @example formatDate("2026-08-01T10:00:00Z") → "Aug 1, 2026"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Async Utilities ──────────────────────────────────────────────────────────

/** Sleep for a given number of milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function — delays execution until `delay` ms after the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Retry an async function up to `maxAttempts` times with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500,
): Promise<T> {
  let lastError: Error | unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}

// ─── Object / Array Utilities ─────────────────────────────────────────────────

/**
 * Omit keys from an object — type-safe.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result;
}

/**
 * Pick keys from an object — type-safe.
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

/**
 * Group an array of objects by a key value.
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

// ─── URL / Media Utilities ────────────────────────────────────────────────────

/**
 * Extract the Cloudinary public_id from a Cloudinary URL.
 * @example extractCloudinaryPublicId("https://res.cloudinary.com/demo/image/upload/v1/storyforge/abc123.jpg")
 *   → "storyforge/abc123"
 */
export function extractCloudinaryPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

/** Check if a string is a valid MongoDB ObjectId (24-character hex string) */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/** Check if a string is a valid email address */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
