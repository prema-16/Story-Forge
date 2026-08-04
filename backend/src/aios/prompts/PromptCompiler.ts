import { memoryGraph } from '../memory/MemoryGraph';
import { logger } from '../../config/logger';

export interface PromptCompileOptions {
  userPrompt: string;
  variables?: Record<string, string>;
  projectId?: string;
  organizationId?: string;
  providerId?: string;
  safetyRules?: string[];
}

export interface CompiledPromptResult {
  compiledPrompt: string;
  systemPrompt: string;
  tokensEstimate: number;
  metadata: {
    appliedVariables: string[];
    brandRulesApplied: boolean;
    safetyRulesApplied: boolean;
  };
}

export class PromptCompiler {
  /**
   * 8-Stage Industrial Prompt Compilation Pipeline
   */
  async compile(options: PromptCompileOptions): Promise<CompiledPromptResult> {
    logger.debug(`[PromptCompiler] Compiling prompt for provider '${options.providerId || 'generic'}'`);

    // Stage 1: Raw Prompt & Variable Interpolation
    let prompt = options.userPrompt;
    const appliedVariables: string[] = [];

    if (options.variables) {
      for (const [key, val] of Object.entries(options.variables)) {
        const placeholder = `{{${key}}}`;
        if (prompt.includes(placeholder)) {
          prompt = prompt.replace(new RegExp(placeholder, 'g'), val);
          appliedVariables.push(key);
        }
      }
    }

    // Stage 2 & 3: Memory Graph Retrieval & Brand Rules
    const brandMemory = await memoryGraph.getBrandContext(options.organizationId, options.projectId);
    let systemInstructions = 'You are an elite YouTube video production AI agent for StoryForge AI.';

    if (Object.keys(brandMemory).length > 0) {
      systemInstructions += `\n\n[Brand Guidelines & Tone Rules]:\n${JSON.stringify(brandMemory, null, 2)}`;
    }

    // Stage 4: Safety & Content Policy Rules
    const safetyRules = options.safetyRules || [
      'Ensure zero hate speech, graphic violence, or copyright infringing content.',
      'Maintain YouTube Partner Program monetizable content guidelines.',
    ];
    systemInstructions += `\n\n[Safety Rules]:\n${safetyRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    // Stage 5 & 6: Provider Adapter Formatting
    if (options.providerId === 'openai') {
      prompt = `${prompt}\n\nPlease format output in clean, structured JSON where appropriate.`;
    } else if (options.providerId === 'anthropic') {
      prompt = `${prompt}\n\nThink step-by-step before outputting final response.`;
    }

    // Stage 7: Prompt Optimizer (whitespace & token efficiency trim)
    const compiledPrompt = prompt.trim().replace(/\n{3,}/g, '\n\n');
    const systemPrompt = systemInstructions.trim();

    // Stage 8: Token Estimation
    const tokensEstimate = Math.ceil((compiledPrompt.length + systemPrompt.length) / 4);

    return {
      compiledPrompt,
      systemPrompt,
      tokensEstimate,
      metadata: {
        appliedVariables,
        brandRulesApplied: Object.keys(brandMemory).length > 0,
        safetyRulesApplied: safetyRules.length > 0,
      },
    };
  }
}

export const promptCompiler = new PromptCompiler();
