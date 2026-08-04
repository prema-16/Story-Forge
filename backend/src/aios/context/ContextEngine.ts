import { memoryGraph } from '../memory/MemoryGraph';
import { Project } from '../../models/Project';
import { User } from '../../models/User';
import { logger } from '../../config/logger';

export interface ContextOptions {
  projectId: string;
  userId: string;
  currentStepId?: string;
  maxTokensLimit?: number;
}

export interface AggregatedContext {
  project: {
    title: string;
    idea: string;
    genre: string;
    videoLength: number;
    style: string;
    aspectRatio: string;
    language: string;
  };
  user: {
    name: string;
    credits: number;
    theme: string;
  };
  brandMemory: Record<string, unknown>;
  previousStepResults: Record<string, unknown>;
  tokenLimit: number;
}

export class ContextEngine {
  /**
   * Aggregate dynamic context across Project, User, Memory, and Previous Steps with token budget optimization.
   */
  async buildContext(options: ContextOptions): Promise<AggregatedContext> {
    logger.debug(`[ContextEngine] Building context for project ${options.projectId}`);

    const projectDoc = await Project.findById(options.projectId);
    const userDoc = await User.findById(options.userId);

    const brandMemory = await memoryGraph.getBrandContext(undefined, options.projectId);

    const project = {
      title: projectDoc?.title || 'Untitled Project',
      idea: projectDoc?.idea || '',
      genre: projectDoc?.genre || 'technology',
      videoLength: projectDoc?.videoLength || 5,
      style: projectDoc?.style || 'cinematic',
      aspectRatio: projectDoc?.aspectRatio || '16:9',
      language: projectDoc?.language || 'en',
    };

    const user = {
      name: userDoc?.name || 'Creator',
      credits: userDoc?.credits || 0,
      theme: userDoc?.preferences?.theme || 'dark',
    };

    const tokenLimit = options.maxTokensLimit || 128000;

    return {
      project,
      user,
      brandMemory,
      previousStepResults: {},
      tokenLimit,
    };
  }
}

export const contextEngine = new ContextEngine();
