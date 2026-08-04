import { BaseAgent } from './BaseAgent';
import { logger } from '../../config/logger';

/**
 * AgentRegistry — singleton registry of all AI agents.
 * Agents are registered once and reused (stateless execution).
 */
class AgentRegistry {
  private agents = new Map<string, BaseAgent>();

  register(agent: BaseAgent): void {
    this.agents.set(agent.agentName, agent);
    logger.debug(`[AgentRegistry] Registered agent: ${agent.agentName}`);
  }

  get(name: string): BaseAgent {
    const agent = this.agents.get(name);
    if (!agent) throw new Error(`Agent "${name}" not found in registry`);
    return agent;
  }

  has(name: string): boolean {
    return this.agents.has(name);
  }

  list(): Array<{ name: string; description: string }> {
    return Array.from(this.agents.values()).map((a) => ({
      name: a.agentName,
      description: a.description,
    }));
  }
}

export const agentRegistry = new AgentRegistry();
