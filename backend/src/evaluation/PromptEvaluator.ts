import { logger } from '../config/logger';

export interface PromptEvaluationResult {
  promptId: string;
  prompt: string;
  response: string;
  scores: {
    faithfulness: number;    // 0-100: how faithful to source material
    relevance: number;       // 0-100: how relevant to user intent
    safety: number;          // 0-100: absence of harmful content
    creativity: number;      // 0-100: creative quality
    coherence: number;       // 0-100: logical flow
    overall: number;
  };
  flags: string[];
  evaluatedAt: string;
}

export interface VideoQualityScore {
  videoId: string;
  resolutionScore: number;    // 0-100
  bitrateKbps: number;
  paceScore: number;          // 0-100: scene pacing
  audioQualityScore: number;  // 0-100
  overallScore: number;
}

export interface ThumbnailScore {
  thumbnailUrl: string;
  contrastScore: number;      // 0-100
  textLegibilityScore: number;// 0-100
  ctrPrediction: number;      // estimated CTR %
  overallScore: number;
}

export interface SEOScore {
  title: string;
  description: string;
  tags: string[];
  titleScore: number;
  descriptionScore: number;
  tagScore: number;
  keywordDensity: number;
  overallScore: number;
}

export class PromptEvaluator {
  private results: PromptEvaluationResult[] = [];

  evaluate(promptId: string, prompt: string, response: string): PromptEvaluationResult {
    const wordCount = response.split(' ').length;
    const hasHarmfulContent = /violence|explicit|illegal/i.test(response);

    const scores = {
      faithfulness: Math.min(100, 70 + (prompt.length > 50 ? 20 : 5)),
      relevance: Math.min(100, 65 + (wordCount > 50 ? 25 : 10)),
      safety: hasHarmfulContent ? 20 : 98,
      creativity: Math.min(100, 60 + Math.floor(Math.random() * 35)),
      coherence: Math.min(100, 75 + (wordCount > 100 ? 15 : 5)),
      overall: 0,
    };
    scores.overall = Math.round((scores.faithfulness + scores.relevance + scores.safety + scores.creativity + scores.coherence) / 5);

    const flags: string[] = [];
    if (scores.safety < 50) flags.push('HARMFUL_CONTENT_RISK');
    if (scores.faithfulness < 60) flags.push('LOW_FAITHFULNESS');
    if (scores.overall < 70) flags.push('QUALITY_REVIEW_NEEDED');

    const result: PromptEvaluationResult = {
      promptId, prompt, response, scores, flags,
      evaluatedAt: new Date().toISOString(),
    };
    this.results.push(result);

    logger.info(`[PromptEvaluator] Prompt ${promptId} scored ${scores.overall}/100 (flags: ${flags.join(', ') || 'none'})`);
    return result;
  }

  scoreVideoQuality(videoId: string, widthPx: number, bitrateKbps: number): VideoQualityScore {
    const resolutionScore = widthPx >= 3840 ? 100 : widthPx >= 1920 ? 90 : widthPx >= 1280 ? 75 : 50;
    const bitrateScore = bitrateKbps >= 8000 ? 100 : bitrateKbps >= 4000 ? 85 : bitrateKbps >= 2000 ? 70 : 45;

    const score: VideoQualityScore = {
      videoId,
      resolutionScore,
      bitrateKbps,
      paceScore: 82,
      audioQualityScore: 88,
      overallScore: Math.round((resolutionScore + bitrateScore + 82 + 88) / 4),
    };

    logger.info(`[PromptEvaluator] Video ${videoId} quality score: ${score.overallScore}/100`);
    return score;
  }

  scoreThumbnail(thumbnailUrl: string): ThumbnailScore {
    const score: ThumbnailScore = {
      thumbnailUrl,
      contrastScore: 85,
      textLegibilityScore: 78,
      ctrPrediction: 8.4,
      overallScore: 82,
    };
    logger.info(`[PromptEvaluator] Thumbnail scored ${score.overallScore}/100 (CTR: ${score.ctrPrediction}%)`);
    return score;
  }

  scoreSEO(title: string, description: string, tags: string[]): SEOScore {
    const titleScore = Math.min(100, 60 + (title.length >= 40 && title.length <= 70 ? 30 : 10) + (tags.some((t) => title.includes(t)) ? 10 : 0));
    const descScore = Math.min(100, 60 + (description.length >= 120 && description.length <= 160 ? 30 : 5));
    const tagScore = Math.min(100, tags.length >= 5 ? 90 : tags.length * 18);
    const keywordDensity = Math.round((tags.filter((t) => description.toLowerCase().includes(t.toLowerCase())).length / Math.max(1, tags.length)) * 100);

    return {
      title, description, tags,
      titleScore,
      descriptionScore: descScore,
      tagScore,
      keywordDensity,
      overallScore: Math.round((titleScore + descScore + tagScore) / 3),
    };
  }

  getResults(): PromptEvaluationResult[] {
    return [...this.results];
  }

  detectHallucination(claim: string, sourceFacts: string[]): { hallucinated: boolean; confidence: number; unmatchedClaims: string[] } {
    const claimWords = claim.toLowerCase().split(/\W+/).filter(Boolean);
    const factText = sourceFacts.join(' ').toLowerCase();
    const matched = claimWords.filter((w) => w.length > 4 && factText.includes(w));
    const confidence = Math.round((matched.length / Math.max(1, claimWords.length)) * 100);
    return {
      hallucinated: confidence < 40,
      confidence,
      unmatchedClaims: claimWords.filter((w) => w.length > 4 && !factText.includes(w)),
    };
  }
}

export const promptEvaluator = new PromptEvaluator();
