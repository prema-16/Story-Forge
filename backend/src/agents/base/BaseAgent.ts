import { providerFactory } from '../../providers/ProviderFactory';
import { ITextProvider } from '../../providers/interfaces/ITextProvider';
import { logger } from '../../config/logger';

export interface AgentContext {
  projectId: string;
  userId: string;
  userMemory?: Record<string, unknown>;
  projectData?: Record<string, unknown>;
  preferredTextProvider?: string;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed: number;
  latencyMs: number;
  provider: string;
  cost: number;
}

/**
 * BaseAgent — abstract class all AI agents extend.
 * Provides standardized provider access, logging, error handling,
 * retry logic, and performance tracking.
 */
export abstract class BaseAgent {
  abstract readonly agentName: string;
  abstract readonly description: string;

  protected get textProvider(): ITextProvider {
    return providerFactory.getTextProvider();
  }

  protected getTextProvider(name?: string): ITextProvider {
    return providerFactory.getTextProvider(name);
  }

  /**
   * Execute the agent's primary task with retry logic.
   */
  async run<T>(
    context: AgentContext,
    payload: Record<string, unknown>,
    maxRetries = 2
  ): Promise<AgentResult<T>> {
    const start = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.warn(`[${this.agentName}] Retry attempt ${attempt}/${maxRetries}`);
          await new Promise((r) => setTimeout(r, 1000 * attempt)); // backoff
        }

        const result = await this.execute<T>(context, payload);
        const latencyMs = Date.now() - start;

        logger.info(`[${this.agentName}] Completed in ${latencyMs}ms (attempt ${attempt + 1})`);

        return { ...result, latencyMs, success: true };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${this.agentName}] Attempt ${attempt + 1} failed:`, lastError.message);
      }
    }

    return {
      success: false,
      error: lastError?.message ?? 'Unknown error',
      tokensUsed: 0,
      latencyMs: Date.now() - start,
      provider: 'unknown',
      cost: 0,
    };
  }

  /**
   * Core execution logic — must be implemented by each agent.
   */
  protected abstract execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>>;

  /**
   * Build a system prompt that incorporates user memory for personalization.
   */
  protected buildSystemPrompt(base: string, memory?: Record<string, unknown>): string {
    if (!memory) return base;

    const personalizations: string[] = [];

    if (memory.writingStyle) personalizations.push(`Writing style: ${memory.writingStyle}`);
    if (memory.preferredTone) personalizations.push(`Tone: ${memory.preferredTone}`);
    if (memory.channelName) personalizations.push(`Creator channel: ${memory.channelName}`);
    if (memory.targetAudience) personalizations.push(`Target audience: ${memory.targetAudience}`);
    if (memory.channelKeywords) personalizations.push(`Channel keywords: ${(memory.channelKeywords as string[]).join(', ')}`);

    if (personalizations.length === 0) return base;

    return `${base}\n\n## User Preferences (apply these to your output)\n${personalizations.map((p) => `- ${p}`).join('\n')}`;
  }

  /**
   * Safely extract JSON from an LLM response that might have markdown code fences.
   */
  protected extractJSON<T>(content: string): T {
    const cleaned = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  }
}
