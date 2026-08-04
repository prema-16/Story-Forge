/**
 * @storyforge/shared — Types
 *
 * Single source of truth for all domain types shared between
 * the frontend (Next.js) and backend (Express + Mongoose).
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

export type ObjectId = string;
export type ISO8601 = string;

export type UserRole = 'user' | 'admin' | 'superadmin';
export type UserPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export type OrgRole = 'owner' | 'admin' | 'member' | 'guest';
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type ProjectStatus = 'draft' | 'generating' | 'review' | 'completed' | 'failed' | 'archived';
export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type RenderStatus = 'pending' | 'rendering' | 'completed' | 'failed';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type TextProvider = 'openai' | 'anthropic' | 'gemini' | 'groq' | 'deepseek' | 'mock';
export type ImageProvider = 'dalle' | 'stability' | 'ideogram' | 'mock';
export type VideoProvider = 'runway' | 'kling' | 'pika' | 'luma' | 'mock';
export type VoiceProvider = 'elevenlabs' | 'openai-tts' | 'google-tts' | 'mock';

export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'discord';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type VideoStyle = 'cinematic' | 'documentary' | 'vlog' | 'animated' | 'minimalist';
export type Genre =
  | 'crime'
  | 'documentary'
  | 'history'
  | 'gaming'
  | 'education'
  | 'technology'
  | 'finance'
  | 'space'
  | 'mystery'
  | 'fantasy'
  | 'other';

// ─── Permissions & RBAC ───────────────────────────────────────────────────────

export type Permission =
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'ai:generate'
  | 'billing:manage'
  | 'org:invite'
  | 'org:manage'
  | 'team:create'
  | 'team:manage'
  | 'video:publish'
  | 'analytics:view'
  | 'admin:dashboard'
  | 'audit:read';

// ─── User & Preferences ───────────────────────────────────────────────────────

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: string;
  timezone: string;
  emailNotifications: {
    generationComplete: boolean;
    renderComplete: boolean;
    creditsLow: boolean;
    securityAlerts: boolean;
  };
}

export interface OAuthAccount {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  linkedAt: ISO8601;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: ISO8601;
  lastUsedAt?: ISO8601;
  expiresAt?: ISO8601;
}

export interface User {
  _id: ObjectId;
  name: string;
  username?: string;
  email: string;
  bio?: string;
  role: UserRole;
  plan: UserPlan;
  credits: number;
  creditsUsed: number;
  creditsTotal: number;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  oauthAccounts: OAuthAccount[];
  apiKeys: ApiKeyItem[];
  preferences: UserPreferences;
  failedLoginAttempts: number;
  lockoutUntil?: ISO8601;
  lastLoginAt?: ISO8601;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface UserPublic
  extends Pick<User, '_id' | 'name' | 'username' | 'email' | 'role' | 'plan' | 'credits' | 'avatar' | 'isTwoFactorEnabled'> {}

// ─── Session Management ───────────────────────────────────────────────────────

export interface SessionDetail {
  tokenId: string;
  userId: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  location?: {
    city?: string;
    country?: string;
  };
  isCurrentSession: boolean;
  createdAt: ISO8601;
  lastUsedAt: ISO8601;
}

// ─── Two-Factor Auth ──────────────────────────────────────────────────────────

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  recoveryCodes: string[];
}

// ─── Organizations & Teams ────────────────────────────────────────────────────

export interface OrgMember {
  userId: ObjectId;
  role: OrgRole;
  joinedAt: ISO8601;
}

export interface Organization {
  _id: ObjectId;
  name: string;
  slug: string;
  logo?: string;
  ownerId: ObjectId;
  members: OrgMember[];
  customRoles: Array<{
    name: string;
    permissions: Permission[];
  }>;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface TeamMember {
  userId: ObjectId;
  role: TeamRole;
  joinedAt: ISO8601;
}

export interface Team {
  _id: ObjectId;
  organizationId: ObjectId;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface Invite {
  _id: ObjectId;
  organizationId: ObjectId;
  teamId?: ObjectId;
  email: string;
  role: OrgRole | TeamRole;
  invitedBy: ObjectId;
  token: string;
  expiresAt: ISO8601;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: ISO8601;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface WorkflowStep {
  step: string;
  status: WorkflowStepStatus;
  creditsUsed: number;
  startedAt?: ISO8601;
  completedAt?: ISO8601;
  error?: string;
}

export interface Project {
  _id: ObjectId;
  userId: ObjectId;
  organizationId?: ObjectId;
  teamId?: ObjectId;
  title: string;
  idea: string;
  genre: Genre;
  videoLength: number; // minutes, max 60
  style: VideoStyle;
  aspectRatio: AspectRatio;
  language: string;
  status: ProjectStatus;
  currentStep: number;
  totalSteps: number;
  creditsTotal: number;
  creditsUsed: number;
  workflowSteps: WorkflowStep[];
  isFavorite: boolean;
  thumbnailUrl?: string;
  videoUrl?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface CreateProjectData {
  title: string;
  idea: string;
  genre: Genre;
  videoLength: number;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  language: string;
  organizationId?: string;
  teamId?: string;
}

export interface UpdateProjectData {
  title?: string;
  idea?: string;
  genre?: Genre;
  videoLength?: number;
  style?: VideoStyle;
  aspectRatio?: AspectRatio;
  language?: string;
  isFavorite?: boolean;
}

// ─── Script, Scene, Prompt, Voice, Thumbnail, SEO ─────────────────────────────

export interface ScriptChapter {
  title: string;
  content: string;
  durationSeconds: number;
  number?: number;
  wordCount?: number;
}

export interface Script {
  _id: ObjectId;
  projectId: ObjectId;
  content: string;
  chapters: ScriptChapter[];
  wordCount: number;
  estimatedDurationSeconds: number;
  language: string;
  provider: TextProvider;
  model: string;
  tokensUsed: number;
  isActive: boolean;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  // UI-enriched fields
  title?: string;
  introduction?: string;
  ending?: string;
  version?: number;
  totalWordCount?: number;
  estimatedDuration?: number;
}

export interface Scene {
  _id: ObjectId;
  projectId: ObjectId;
  scriptId: ObjectId;
  order: number;
  title: string;
  description: string;
  narration: string;
  duration: number;
  keywords: string[];
  mood: string;
  setting: string;
  cameraAngle?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  // UI-enriched fields
  sceneNumber?: number;
  visualDescription?: string;
  cameraMovement?: string;
}

export interface Prompt {
  _id: ObjectId;
  projectId: ObjectId;
  sceneId: ObjectId;
  positivePrompt: string;
  negativePrompt: string;
  style: string;
  aspectRatio: AspectRatio;
  provider: ImageProvider | VideoProvider;
  model: string;
  mediaUrl?: string;
  status: WorkflowStepStatus;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface Voice {
  _id: ObjectId;
  projectId: ObjectId;
  audioUrl: string;
  duration: number;
  language: string;
  voiceId: string;
  provider: VoiceProvider;
  isNarration: boolean;
  status: WorkflowStepStatus;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  // UI-enriched fields
  voiceName?: string;
  durationSeconds?: number;
}

export interface Thumbnail {
  _id: ObjectId;
  projectId: ObjectId;
  imageUrl: string;
  width: number;
  height: number;
  concept: string;
  provider: ImageProvider;
  clickThroughScore?: number;
  isSelected: boolean;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  // UI-enriched fields
  titleText?: string;
  composition?: string;
  colorPalette?: string[];
}

export interface SEOData {
  title: string;
  description: string;
  tags: string[];
  category: string;
  defaultLanguage: string;
  chaptersText?: string;
  pinCommentText?: string;
  // UI-enriched fields
  titleScore?: number;
}

// ─── Video & Export ───────────────────────────────────────────────────────────

export interface VideoRender {
  _id: ObjectId;
  projectId: ObjectId;
  status: RenderStatus;
  progress: number;
  videoUrl?: string;
  duration?: number;
  fileSize?: number;
  resolution: string;
  fps: number;
  codec: string;
  errorMessage?: string;
  startedAt?: ISO8601;
  completedAt?: ISO8601;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface Export {
  _id: ObjectId;
  projectId: ObjectId;
  type: 'youtube' | 'download' | 'archive';
  status: ExportStatus;
  downloadUrl?: string;
  expiresAt?: ISO8601;
  metadata?: Record<string, unknown>;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

// ─── Audit Logging ────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'user.register'
  | 'user.login'
  | 'user.login_failed'
  | 'user.account_locked'
  | 'user.logout'
  | 'user.logout_all'
  | 'user.password_change'
  | 'user.email_change'
  | 'user.profile_update'
  | 'user.2fa_enabled'
  | 'user.2fa_disabled'
  | 'user.apikey_created'
  | 'user.apikey_revoked'
  | 'org.create'
  | 'org.update'
  | 'org.invite_sent'
  | 'org.invite_accepted'
  | 'team.create'
  | 'team.member_added'
  | 'role.change'
  | 'permission.change'
  | 'project.create'
  | 'project.delete'
  | 'project.generate'
  | 'project.render'
  | 'billing.subscription_changed';

export interface AuditLogEntry {
  _id: ObjectId;
  userId?: ObjectId;
  action: AuditEventType | string;
  ip?: string;
  userAgent?: string;
  resourceId?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
  createdAt: ISO8601;
}

// ─── AI Agent ─────────────────────────────────────────────────────────────────

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed: number;
  latencyMs: number;
  provider: string;
  cost: number;
}

export interface WorkflowPlan {
  steps: Array<{
    agentName: string;
    order: number;
    description: string;
    estimatedCredits: number;
    dependsOn: string[];
    canParallelize: boolean;
  }>;
  totalEstimatedCredits: number;
  estimatedDurationSeconds: number;
  selectedProviders: Record<string, string>;
}

// ─── API Response & Pagination ────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── SSE Events ───────────────────────────────────────────────────────────────

export type SSEEventType =
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'step_progress'
  | 'generation_complete'
  | 'render_progress'
  | 'render_complete'
  | 'render_failed'
  | 'credits_updated'
  | 'connected';

export interface SSEEvent {
  type: SSEEventType;
  projectId: string;
  step?: string;
  progress?: number;
  data?: Record<string, unknown>;
  error?: string;
  timestamp: ISO8601;
}

export type GenerationStepKey =
  | 'script'
  | 'scenes'
  | 'prompts'
  | 'voice'
  | 'thumbnail'
  | 'seo'
  | 'render';

export const STEP_AGENT_MAP: Record<GenerationStepKey, string[]> = {
  script: ['ai-writer', 'writer'],
  scenes: ['ai-scene-planner', 'scene-planner', 'scenes'],
  prompts: ['ai-prompt-engineer', 'prompt-engineer', 'prompts'],
  voice: ['ai-voice-director', 'voice-director', 'voice'],
  thumbnail: ['ai-thumbnail-designer', 'thumbnail-designer', 'thumbnail'],
  seo: ['ai-seo-specialist', 'seo-specialist', 'seo'],
  render: ['ai-video-director', 'render'],
};

// ─── Phase 7: AI Shorts Studio Types ──────────────────────────────────────────

export type ShortInputType =
  | 'prompt'
  | 'script'
  | 'long_youtube'
  | 'podcast'
  | 'url'
  | 'blog'
  | 'pdf'
  | 'docx'
  | 'reddit'
  | 'x_thread'
  | 'audio'
  | 'storyforge_project'
  | 'existing_script'
  | 'ai_idea';

export type ShortDuration = 15 | 20 | 30 | 45 | 60 | 90;

export type HookType =
  | 'curiosity'
  | 'shock'
  | 'question'
  | 'statistic'
  | 'story'
  | 'mystery'
  | 'fear'
  | 'emotional'
  | 'news'
  | 'history'
  | 'crime'
  | 'technology'
  | 'motivation'
  | 'finance'
  | 'gaming'
  | 'health'
  | 'educational';

export interface HookVariation {
  id: string;
  type: HookType;
  hookText: string;
  estimatedRetentionMultiplier: number;
  explanation: string;
}

export type VisualStyle =
  | 'photorealistic'
  | 'anime'
  | 'pixar'
  | 'disney'
  | 'comic'
  | 'cyberpunk'
  | 'documentary'
  | 'film_noir'
  | '3d'
  | 'minimal'
  | 'watercolor'
  | 'vintage'
  | 'clay'
  | 'fantasy'
  | 'sci_fi';

export type VideoAIProvider =
  | 'runway'
  | 'kling'
  | 'pika'
  | 'google_veo'
  | 'openai_sora'
  | 'luma'
  | 'auto';

export type SubtitleStyle =
  | 'tiktok'
  | 'capcut'
  | 'mrbeast'
  | 'netflix'
  | 'karaoke'
  | 'bounce'
  | 'glow'
  | 'highlight'
  | 'animated'
  | 'word_by_word';

export interface ViralityScoreBreakdown {
  overallScore: number; // 0 - 100
  hookScore: number;
  retentionScore: number;
  visualsScore: number;
  captionsScore: number;
  voiceScore: number;
  musicScore: number;
  sceneTimingScore: number;
  colorScore: number;
  seoScore: number;
  platformOptimizationScore: number;
  suggestions: string[];
}

export interface RetentionPrediction {
  threeSecondRetentionPct: number;
  tenSecondRetentionPct: number;
  completionRatePct: number;
  expectedWatchTimeSeconds: number;
  expectedShares: number;
  expectedComments: number;
  expectedSubscribers: number;
  expectedCTR: number;
}

export interface ShortScene {
  id: string;
  order: number;
  startTimeSeconds: number;
  durationSeconds: number;
  narrationText: string;
  visualPrompt: string;
  cameraMovement: string;
  lens: string;
  lighting: string;
  composition: string;
  animation: string;
  soundEffect?: string;
  transition: string;
  bRollType?: 'stock' | 'generated' | 'motion_graphics' | 'map' | 'chart' | 'infographic';
}

export interface ShortsProject {
  _id: string;
  userId: string;
  title: string;
  inputType: ShortInputType;
  sourceContent: string;
  targetDurationSeconds: ShortDuration;
  visualStyle: VisualStyle;
  videoProvider: VideoAIProvider;
  subtitleStyle: SubtitleStyle;
  selectedHook: HookVariation;
  hookVariations: HookVariation[];
  viralityScore: ViralityScoreBreakdown;
  retentionPrediction: RetentionPrediction;
  scenes: ShortScene[];
  voiceId: string;
  voiceCategory: 'male' | 'female' | 'documentary' | 'storyteller' | 'podcast' | 'news' | 'motivation' | 'gaming' | 'corporate';
  musicGenre: string;
  status: 'draft' | 'queued' | 'processing' | 'ready' | 'published' | 'failed';
  videoUrl?: string;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface BatchShortsJob {
  id: string;
  userId: string;
  totalShortsCount: number; // e.g. 10, 20, 50, 100, 500
  completedCount: number;
  failedCount: number;
  totalCreditsRequired: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progressPercentage: number;
  estimatedEtaSeconds: number;
  shortsProjects: ShortsProject[];
  createdAt: string;
}

export interface ShortsAnalytics {
  totalViews: number;
  averageCTR: number;
  averageCompletionRate: number;
  totalShares: number;
  totalLikes: number;
  totalComments: number;
  subscribersGained: number;
  estimatedRevenueUSD: number;
  averageRPM: number;
  platformBreakdown: Record<string, { views: number; ctr: number; retention: number }>;
}

