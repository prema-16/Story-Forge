import { BaseAgentV2 } from './BaseAgentV2';
import { IdeaAgent, ResearchAgent, TrendAgent, FactCheckerAgent } from './ResearchAgents';
import { WriterAgent, ScriptReviewerAgent, ScenePlannerAgent, PromptEngineerAgent } from './CreativeAgents';
import { ImageDirectorAgent, VoiceDirectorAgent, MusicDirectorAgent, SubtitleAgent, SEOAgent, ThumbnailAgent, VideoDirectorAgent } from './MediaAgents';
import { QAAgent, PublisherAgent, AnalyticsAgent, AIDirectorV2 } from './OperationalAgents';
import { logger } from '../../config/logger';

export class AgentRegistryV2 {
  private agents = new Map<string, BaseAgentV2>();

  register(agent: BaseAgentV2): void {
    this.agents.set(agent.agentId, agent);
    logger.info(`[AgentRegistryV2] Registered agent: ${agent.name} (${agent.agentId})`);
  }

  get(agentId: string): BaseAgentV2 | null {
    return this.agents.get(agentId) || null;
  }

  list(): BaseAgentV2[] {
    return Array.from(this.agents.values());
  }
}

export const agentRegistryV2 = new AgentRegistryV2();

import {
  HookAgent, RetentionAgent, ViralityScorerAgent, TransitionAgent, SoundEffectAgent,
  ColorGradingAgent, BatchAgent, AIClipFinderAgent, TrendEngineAgent,
  ShortsScriptAgent, ShortsScenePlannerAgent
} from './ShortsAgents';

export function bootstrapAgentsV2(): void {
  agentRegistryV2.register(new IdeaAgent());
  agentRegistryV2.register(new ResearchAgent());
  agentRegistryV2.register(new TrendAgent());
  agentRegistryV2.register(new FactCheckerAgent());
  agentRegistryV2.register(new WriterAgent());
  agentRegistryV2.register(new ScriptReviewerAgent());
  agentRegistryV2.register(new ScenePlannerAgent());
  agentRegistryV2.register(new PromptEngineerAgent());
  agentRegistryV2.register(new ImageDirectorAgent());
  agentRegistryV2.register(new VoiceDirectorAgent());
  agentRegistryV2.register(new MusicDirectorAgent());
  agentRegistryV2.register(new SubtitleAgent());
  agentRegistryV2.register(new SEOAgent());
  agentRegistryV2.register(new ThumbnailAgent());
  agentRegistryV2.register(new VideoDirectorAgent());
  agentRegistryV2.register(new QAAgent());
  agentRegistryV2.register(new PublisherAgent());
  agentRegistryV2.register(new AnalyticsAgent());
  agentRegistryV2.register(new AIDirectorV2());

  // Phase 7 Shorts Agent Swarm Registration
  agentRegistryV2.register(new HookAgent());
  agentRegistryV2.register(new RetentionAgent());
  agentRegistryV2.register(new ViralityScorerAgent());
  agentRegistryV2.register(new TransitionAgent());
  agentRegistryV2.register(new SoundEffectAgent());
  agentRegistryV2.register(new ColorGradingAgent());
  agentRegistryV2.register(new BatchAgent());
  agentRegistryV2.register(new AIClipFinderAgent());
  agentRegistryV2.register(new TrendEngineAgent());
  agentRegistryV2.register(new ShortsScriptAgent());
  agentRegistryV2.register(new ShortsScenePlannerAgent());
}

bootstrapAgentsV2();
