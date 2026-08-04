import { distributedRenderEngine } from '../DistributedRenderEngine';
import { renderFarmScheduler } from '../RenderFarmScheduler';
import { encodingSystem } from '../../encoding/EncodingSystem';
import { publishingEngine } from '../../publishing/PublishingEngine';
import { renderCostEstimator } from '../extras/ProductionExtras';

describe('Phase 4 Distributed Rendering Engine & Publishing Tests', () => {
  it('should schedule GPU jobs to GPU worker nodes', () => {
    const gpuWorker = renderFarmScheduler.scheduleJob(true);
    expect(gpuWorker).toBeDefined();
    expect(gpuWorker?.type).toBe('gpu');
  });

  it('should execute distributed video rendering with checkpoint recovery', async () => {
    const result = await distributedRenderEngine.renderDistributed({
      jobId: 'test_job_101',
      projectId: 'test_proj_202',
      resolution: '1080p',
      format: 'mp4',
      quality: 'standard',
      totalScenes: 4,
    });

    expect(result.jobId).toBe('test_job_101');
    expect(result.videoUrl).toBeDefined();
    expect(result.renderTimeSeconds).toBeGreaterThan(0);
  });

  it('should transcode media asset using QualityPresets', async () => {
    const res = await encodingSystem.transcode({
      inputPath: '/raw/input.mov',
      outputPath: '/export/output.mp4',
      format: 'mp4',
      qualityPreset: 'high',
    });

    expect(res.format).toBe('mp4');
    expect(res.qualityPreset).toBe('high');
  });

  it('should dispatch publishing request across YouTube and TikTok', async () => {
    const results = await publishingEngine.publishToPlatforms({
      id: 'pub_test_1',
      projectId: 'proj_1',
      videoUrl: 'http://test.mp4',
      platforms: ['youtube', 'tiktok'],
      title: 'Quantum Physics Short',
      description: 'AI Video',
      tags: ['quantum'],
      visibility: 'public',
    });

    expect(results.length).toBe(2);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('should calculate render cost estimate prior to launch', () => {
    const costUSD = renderCostEstimator.estimateRenderCost('4K', 300, true);
    expect(costUSD).toBeGreaterThan(0);
  });
});
