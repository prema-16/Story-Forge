import { logger } from '../config/logger';

export interface ScalingForecast {
  timestamp: string;
  currentLoad: number;
  predictedLoadIn15Min: number;
  predictedLoadIn60Min: number;
  recommendedPodCount: number;
  scaleDirection: 'up' | 'down' | 'stable';
  confidence: number;
}

export class PredictiveScalingService {
  private loadHistory: { timestamp: number; rps: number }[] = [];
  private readonly minPods = 2;
  private readonly maxPods = 50;
  private readonly targetRpsPerPod = 200;

  recordLoad(rps: number): void {
    this.loadHistory.push({ timestamp: Date.now(), rps });
    if (this.loadHistory.length > 1000) {
      this.loadHistory.shift();
    }
  }

  private exponentialSmoothing(data: number[], alpha = 0.3): number {
    if (data.length === 0) return 0;
    let smoothed = data[0];
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }
    return smoothed;
  }

  generateForecast(): ScalingForecast {
    const recent = this.loadHistory.slice(-60).map((h) => h.rps);
    const currentLoad = recent[recent.length - 1] || 100;
    const trend = recent.length > 1 ? recent[recent.length - 1] - recent[0] : 0;

    const predictedLoad15 = Math.max(0, this.exponentialSmoothing(recent) + trend * 0.25);
    const predictedLoad60 = Math.max(0, this.exponentialSmoothing(recent) + trend * 1.0);

    const maxPredicted = Math.max(currentLoad, predictedLoad15, predictedLoad60);
    const recommendedPods = Math.min(this.maxPods, Math.max(this.minPods, Math.ceil(maxPredicted / this.targetRpsPerPod)));
    const currentPods = Math.ceil(currentLoad / this.targetRpsPerPod) || this.minPods;

    const forecast: ScalingForecast = {
      timestamp: new Date().toISOString(),
      currentLoad,
      predictedLoadIn15Min: Math.round(predictedLoad15),
      predictedLoadIn60Min: Math.round(predictedLoad60),
      recommendedPodCount: recommendedPods,
      scaleDirection: recommendedPods > currentPods ? 'up' : recommendedPods < currentPods ? 'down' : 'stable',
      confidence: Math.min(99, 70 + recent.length * 0.3),
    };

    logger.info(`[PredictiveScalingService] Forecast: Load=${currentLoad}rps, Predicted15m=${forecast.predictedLoadIn15Min}rps, Pods=${recommendedPods} (${forecast.scaleDirection})`);
    return forecast;
  }
}

export const predictiveScalingService = new PredictiveScalingService();
