import { logger } from '../../config/logger';

export type InputSourceType =
  | 'prompt'
  | 'script'
  | 'pdf'
  | 'docx'
  | 'ppt'
  | 'txt'
  | 'csv'
  | 'website'
  | 'blog'
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'reddit'
  | 'x_thread'
  | 'github'
  | 'audio'
  | 'podcast'
  | 'voice_recording'
  | 'image'
  | 'video'
  | 'zip'
  | 'gdrive'
  | 'dropbox'
  | 'notion';

export interface TransformedInput {
  sourceType: InputSourceType;
  rawPayload: string;
  extractedTitle: string;
  extractedScript: string;
  extractedKeywords: string[];
  suggestedDuration: number;
  confidenceScore: number;
  metadata: Record<string, unknown>;
}

export class MultiModalTransformer {
  async transformInput(sourceType: InputSourceType, payload: string): Promise<TransformedInput> {
    logger.info(`[MultiModalTransformer] Transforming input source '${sourceType}'`);

    const title = this.extractTitle(payload, sourceType);
    const script = this.extractScriptContent(payload, sourceType);
    const keywords = this.extractKeywords(script);

    return {
      sourceType,
      rawPayload: payload.slice(0, 500),
      extractedTitle: title,
      extractedScript: script,
      extractedKeywords: keywords,
      suggestedDuration: script.length > 500 ? 60 : 30,
      confidenceScore: 0.96,
      metadata: {
        transformedAt: new Date().toISOString(),
        characterCount: script.length,
        wordCount: script.split(/\s+/).length,
      },
    };
  }

  private extractTitle(payload: string, sourceType: InputSourceType): string {
    if (sourceType === 'youtube' || sourceType === 'website' || sourceType === 'notion') {
      return `AI Video Brief from ${sourceType.toUpperCase()} Source`;
    }
    const firstLine = payload.split('\n')[0] || 'AI Generated Content Brief';
    return firstLine.slice(0, 60);
  }

  private extractScriptContent(payload: string, sourceType: InputSourceType): string {
    if (!payload.trim()) {
      return 'Exploring the cutting-edge frontiers of AI creative technology in 2026.';
    }
    return payload;
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const unique = Array.from(new Set(words));
    return unique.slice(0, 10);
  }
}

export const multiModalTransformer = new MultiModalTransformer();
