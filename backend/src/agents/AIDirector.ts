import { BaseAgent, AgentContext, AgentResult } from './base/BaseAgent';
import { agentRegistry } from './base/AgentRegistry';
import { providerFactory } from '../providers/ProviderFactory';
import { logger } from '../config/logger';
import { CREDIT_COSTS } from '@storyforge/shared';

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

export interface DirectorPayload {
  idea: string;
  genre: string;
  videoLength: number;
  style: string;
  language: string;
  aspectRatio: string;
  voice?: string;
  skipSteps?: string[];
  userMemory?: Record<string, unknown>;
}

/**
 * AIDirector — the master orchestrator agent.
 * Responsibilities:
 * - Understand user intent
 * - Plan the workflow
 * - Select optimal AI providers based on cost/quality
 * - Estimate credit usage
 * - Delegate tasks to specialized agents
 * - Monitor execution and handle failures
 */
export class AIDirector extends BaseAgent {
  readonly agentName = 'ai-director';
  readonly description = 'Master orchestrator: plans, delegates, and monitors all AI agents';

  /**
   * Generate a complete workflow plan from a user idea.
   */
  async planWorkflow(
    context: AgentContext,
    payload: DirectorPayload
  ): Promise<WorkflowPlan> {
    const creditMap: Record<string, number> = {
      ...CREDIT_COSTS,
      'ai-video-director': CREDIT_COSTS['ai-video-director'] * Math.ceil(payload.videoLength * 1.5), // per scene
    };

    const selectedProviders = providerFactory.getAvailableProviders();

    const allSteps = [
      { agentName: 'ai-writer', order: 1, description: 'Generate script and story', estimatedCredits: creditMap['ai-writer'], dependsOn: [], canParallelize: false },
      { agentName: 'ai-scene-planner', order: 2, description: 'Break script into scenes with timing', estimatedCredits: creditMap['ai-scene-planner'], dependsOn: ['ai-writer'], canParallelize: false },
      { agentName: 'ai-prompt-engineer', order: 3, description: 'Generate cinematic AI prompts for all scenes', estimatedCredits: creditMap['ai-prompt-engineer'], dependsOn: ['ai-scene-planner'], canParallelize: true },
      { agentName: 'ai-voice-director', order: 4, description: 'Synthesize narration audio', estimatedCredits: creditMap['ai-voice-director'], dependsOn: ['ai-writer'], canParallelize: true },
      { agentName: 'ai-thumbnail-designer', order: 5, description: 'Generate thumbnail concept and image', estimatedCredits: creditMap['ai-thumbnail-designer'], dependsOn: ['ai-writer'], canParallelize: true },
      { agentName: 'ai-seo-specialist', order: 6, description: 'Generate YouTube SEO metadata', estimatedCredits: creditMap['ai-seo-specialist'], dependsOn: ['ai-writer'], canParallelize: true },
      { agentName: 'ai-video-director', order: 7, description: 'Generate video clips for all scenes', estimatedCredits: creditMap['ai-video-director'], dependsOn: ['ai-prompt-engineer'], canParallelize: false },
      { agentName: 'ai-video-editor', order: 8, description: 'Apply transitions, effects, and merge clips', estimatedCredits: creditMap['ai-video-editor'], dependsOn: ['ai-video-director', 'ai-voice-director'], canParallelize: false },
      { agentName: 'ai-qa-reviewer', order: 9, description: 'Quality review of all generated content', estimatedCredits: creditMap['ai-qa-reviewer'], dependsOn: ['ai-scene-planner', 'ai-prompt-engineer'], canParallelize: false },
      { agentName: 'ai-publisher', order: 10, description: 'Prepare export package with metadata', estimatedCredits: creditMap['ai-publisher'], dependsOn: ['ai-qa-reviewer', 'ai-video-editor'], canParallelize: false },
    ];

    // Filter out skipped steps
    const steps = payload.skipSteps
      ? allSteps.filter((s) => !payload.skipSteps!.includes(s.agentName))
      : allSteps;

    const totalEstimatedCredits = steps.reduce((sum, s) => sum + s.estimatedCredits, 0);

    // Rough estimate: 30s per lightweight step, 5min for video generation
    const estimatedDurationSeconds = steps.reduce((sum, s) => {
      if (s.agentName === 'ai-video-director') return sum + 300;
      if (s.agentName === 'ai-voice-director') return sum + 60;
      return sum + 15;
    }, 0);

    logger.info(`[AIDirector] Workflow planned: ${steps.length} steps, ~${totalEstimatedCredits} credits`);

    return {
      steps,
      totalEstimatedCredits,
      estimatedDurationSeconds,
      selectedProviders: {
        text: selectedProviders.text[0] ?? 'mock',
        image: selectedProviders.image[0] ?? 'mock',
        video: selectedProviders.video[0] ?? 'mock',
        voice: selectedProviders.voice[0] ?? 'mock',
      },
    };
  }

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const plan = await this.planWorkflow(context, payload as unknown as DirectorPayload);
    return {
      data: plan as T,
      tokensUsed: 0,
      provider: 'internal',
      cost: 0,
    };
  }
}

// Register the director
export const aiDirector = new AIDirector();
agentRegistry.register(aiDirector);
