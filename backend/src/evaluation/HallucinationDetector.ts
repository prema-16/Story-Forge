import { logger } from '../config/logger';

export class HallucinationDetector {
  check(output: string, referenceFacts: string[]): { isHallucination: boolean; confidence: number } {
    const text = output.toLowerCase();
    const matches = referenceFacts.filter((fact) => text.includes(fact.toLowerCase()));
    const confidence = referenceFacts.length > 0 ? (matches.length / referenceFacts.length) * 100 : 100;
    const isHallucination = confidence < 50;

    logger.info(`[HallucinationDetector] Grounding check confidence: ${confidence.toFixed(1)}% (isHallucination=${isHallucination})`);
    return { isHallucination, confidence: Math.round(confidence) };
  }
}

export const hallucinationDetector = new HallucinationDetector();
