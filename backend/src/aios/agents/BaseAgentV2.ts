import { providerRegistry } from '../providers/ProviderRegistry';
import { logger } from '../../config/logger';

export interface AgentContextV2 {
  projectId: string;
  userId: string;
  organizationId?: string;
  teamId?: string;
  preferredProvider?: string;
  brandMemory?: Record<string, unknown>;
  previousStepOutputs?: Record<string, unknown>;
}

export interface AgentExecuteResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed: number;
  latencyMs: number;
  provider: string;
  costUSD: number;
  evaluationScore?: number; // 0.0 - 1.0
}

export abstract class BaseAgentV2 {
  abstract readonly agentId: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly defaultCredits: number;

  async initialize(context: AgentContextV2): Promise<void> {
    logger.debug(`[${this.agentId}] Initialized with context for project: ${context.projectId}`);
  }

  abstract execute<T = unknown>(context: AgentContextV2, payload: Record<string, unknown>): Promise<AgentExecuteResult<T>>;

  async *stream(context: AgentContextV2, payload: Record<string, unknown>): AsyncGenerator<string, void, unknown> {
    const result = await this.execute(context, payload);
    if (result.data) {
      yield typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
    }
  }

  async validate<T>(data: T): Promise<{ isValid: boolean; reason?: string }> {
    if (!data) return { isValid: false, reason: 'Output data is null or empty' };
    return { isValid: true };
  }

  async rollback(context: AgentContextV2, stepId: string): Promise<boolean> {
    logger.warn(`[${this.agentId}] Rollback triggered for step ${stepId}`);
    return true;
  }

  estimateCost(payload: Record<string, unknown>): number {
    return (this.defaultCredits * 0.01); // $0.01 per credit estimate
  }

  estimateLatency(payload: Record<string, unknown>): number {
    return 1500; // 1.5s default latency estimate
  }

  estimateTokens(payload: Record<string, unknown>): number {
    return 500; // 500 tokens default estimate
  }

  async evaluate<T>(result: AgentExecuteResult<T>): Promise<number> {
    if (!result.success || !result.data) return 0.0;
    return 0.95; // Default quality score 95%
  }
}
