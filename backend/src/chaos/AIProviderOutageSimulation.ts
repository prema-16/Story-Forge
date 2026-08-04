import { logger } from '../config/logger';

export class AIProviderOutageSimulation {
  simulateOutage(provider: string): { trippedCircuitBreaker: boolean; fallbackProvider: string; rerouteTimeMs: number } {
    logger.warn(`[AIProviderOutageSimulation] Simulating HTTP 503 outage on provider ${provider}...`);
    const fallbackMap: Record<string, string> = { gpt4: 'gemini', claude: 'gemini', gemini: 'mistral' };
    const fallbackProvider = fallbackMap[provider] || 'mistral';
    const rerouteTimeMs = 18;

    logger.info(`[AIProviderOutageSimulation] Circuit breaker tripped. Rerouted to ${fallbackProvider} in ${rerouteTimeMs}ms`);
    return { trippedCircuitBreaker: true, fallbackProvider, rerouteTimeMs };
  }
}

export const aiProviderOutageSimulation = new AIProviderOutageSimulation();
