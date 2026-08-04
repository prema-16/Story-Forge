/**
 * @storyforge/shared — Constants
 *
 * Application-wide constants. Single source of truth — no magic numbers
 * anywhere in frontend or backend code.
 */

import type { Genre, VideoStyle, AspectRatio, Permission, OrgRole, TeamRole } from '../types';

// ─── Video Configuration ───────────────────────────────────────────────────────

/** Maximum allowed video duration in minutes */
export const MAX_VIDEO_LENGTH = 60;

/** Minimum allowed video duration in minutes */
export const MIN_VIDEO_LENGTH = 1;

/** Default video duration in minutes */
export const DEFAULT_VIDEO_LENGTH = 5;

// ─── Credits ──────────────────────────────────────────────────────────────────

/**
 * Credit cost per generation step.
 * Used by AIDirector for planning, and requireCredits middleware for enforcement.
 * Changing here updates both frontend display AND backend validation.
 */
export const CREDIT_COSTS: Record<string, number> = {
  'ai-writer': 5,
  'ai-scene-planner': 3,
  'ai-prompt-engineer': 3,
  'ai-voice-director': 10,
  'ai-thumbnail-designer': 8,
  'ai-seo-specialist': 2,
  'ai-video-director': 20, // per scene, multiplied at runtime
  'ai-video-editor': 5,
  'ai-qa-reviewer': 2,
  'ai-publisher': 1,
};

/** Credits given to new users on registration */
export const INITIAL_CREDITS = 100;

/** Low-credits warning threshold */
export const LOW_CREDITS_THRESHOLD = 50;

// ─── RBAC Role-Permission Defaults ───────────────────────────────────────────

export const DEFAULT_ORG_ROLE_PERMISSIONS: Record<OrgRole, Permission[]> = {
  owner: [
    'project:create',
    'project:read',
    'project:update',
    'project:delete',
    'ai:generate',
    'billing:manage',
    'org:invite',
    'org:manage',
    'team:create',
    'team:manage',
    'video:publish',
    'analytics:view',
    'audit:read',
  ],
  admin: [
    'project:create',
    'project:read',
    'project:update',
    'project:delete',
    'ai:generate',
    'org:invite',
    'team:create',
    'team:manage',
    'video:publish',
    'analytics:view',
    'audit:read',
  ],
  member: [
    'project:create',
    'project:read',
    'project:update',
    'ai:generate',
    'video:publish',
    'analytics:view',
  ],
  guest: ['project:read', 'analytics:view'],
};

export const DEFAULT_TEAM_ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  owner: [
    'project:create',
    'project:read',
    'project:update',
    'project:delete',
    'ai:generate',
    'team:manage',
    'video:publish',
    'analytics:view',
  ],
  admin: [
    'project:create',
    'project:read',
    'project:update',
    'project:delete',
    'ai:generate',
    'team:manage',
    'video:publish',
    'analytics:view',
  ],
  editor: [
    'project:create',
    'project:read',
    'project:update',
    'ai:generate',
    'video:publish',
  ],
  viewer: ['project:read', 'analytics:view'],
};

// ─── Security Limits ──────────────────────────────────────────────────────────

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const RECOVERY_CODES_COUNT = 8;
export const API_KEY_PREFIX = 'sf_live_';

// ─── Genre Options ────────────────────────────────────────────────────────────

export const GENRES: Array<{ value: Genre; label: string }> = [
  { value: 'crime', label: 'Crime' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'history', label: 'History' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'space', label: 'Space' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'other', label: 'Other' },
];

// ─── Style Options ────────────────────────────────────────────────────────────

export const VIDEO_STYLES: Array<{ value: VideoStyle; label: string; description: string }> = [
  { value: 'cinematic', label: 'Cinematic', description: 'Movie-quality visuals with dramatic lighting' },
  { value: 'documentary', label: 'Documentary', description: 'Authentic, journalistic visual style' },
  { value: 'vlog', label: 'Vlog', description: 'Casual, personal, handheld feel' },
  { value: 'animated', label: 'Animated', description: 'Illustrated and animated visuals' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean, simple, text-focused' },
];

// ─── Aspect Ratio Options ─────────────────────────────────────────────────────

export const ASPECT_RATIOS: Array<{ value: AspectRatio; label: string; description: string }> = [
  { value: '16:9', label: '16:9', description: 'YouTube Standard' },
  { value: '9:16', label: '9:16', description: 'Shorts / Reels' },
  { value: '1:1', label: '1:1', description: 'Square / Instagram' },
  { value: '4:3', label: '4:3', description: 'Classic' },
];

// ─── Workflow Step Labels ──────────────────────────────────────────────────────

export const STEP_LABELS: Record<string, string> = {
  script: 'Script',
  scenes: 'Scenes',
  prompts: 'AI Prompts',
  voice: 'Voice',
  thumbnail: 'Thumbnail',
  seo: 'SEO',
  render: 'Render Video',
};

// ─── Status Display ───────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  draft: 'text-slate-400',
  generating: 'text-amber-400',
  review: 'text-blue-400',
  completed: 'text-emerald-400',
  failed: 'text-red-400',
  archived: 'text-slate-500',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  generating: 'Generating',
  review: 'In Review',
  completed: 'Completed',
  failed: 'Failed',
  archived: 'Archived',
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const GENERATION_RATE_LIMIT_MAX = 10; // generation endpoints

// ─── SSE ──────────────────────────────────────────────────────────────────────

export const SSE_HEARTBEAT_INTERVAL_MS = 30_000;

// ─── Redis Keys ───────────────────────────────────────────────────────────────

export const REDIS_KEYS = {
  projectProgress: (projectId: string) => `project:${projectId}:progress`,
  tokenBlacklist: (jti: string) => `token:blacklist:${jti}`,
  refreshToken: (userId: string, tokenId: string) => `refresh:${userId}:${tokenId}`,
  userSessions: (userId: string) => `sessions:${userId}`,
  generationLock: (projectId: string, step: string) => `lock:${projectId}:${step}`,
  twoFactorSecret: (userId: string) => `2fa:secret:${userId}`,
  loginAttempts: (ipOrEmail: string) => `login:attempts:${ipOrEmail}`,
  lockout: (userId: string) => `lockout:${userId}`,
} as const;

// ─── Queue Names ──────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  GENERATION: 'generation',
  RENDER: 'render',
  PUBLISH: 'publish',
  CLEANUP: 'cleanup',
  EMAIL: 'email',
} as const;
