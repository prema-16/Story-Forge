// Re-export all backend-aligned types from api layer
export type {
  User,
  Project,
  WorkflowStep,
  WorkflowPlan,
  Script,
  Scene,
  Thumbnail,
  Voice,
  SEOData,
  CreateProjectData,
  PaginationMeta,
} from '../lib/api';

// ========================
// UI-only Types
// ========================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  adminOnly?: boolean;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface WorkflowStepUI {
  id: string;
  label: string;
  emoji: string;
  description: string;
  creditsEstimate: number;
  storeKey: string;
  generateFn?: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'purple' | 'green' | 'amber' | 'cyan' | 'pink';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  projectId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  genre: string;
  style: string;
  description: string;
  prompt: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
}

export type ExportFormat = 'mp4' | 'zip' | 'script' | 'json' | 'srt' | 'thumbnail' | 'metadata';

export interface SSEEvent {
  type: 'connected' | 'heartbeat' | 'progress' | 'completed' | 'error';
  projectId?: string;
  step?: string;
  percentage?: number;
  message?: string;
  timestamp?: number;
}
