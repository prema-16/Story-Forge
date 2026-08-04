import { Worker, Job } from 'bullmq';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';
import { RenderJobData } from '../queues/index';
import { Project } from '../models/Project';
import { Scene } from '../models/Scene';
import { Voice } from '../models/Voice';
import { Export } from '../models/Export';
import { renderEngine, RenderSceneInput } from '../services/RenderEngine';
import { publishProgress } from '../services/PubSubService';

export function startRenderWorker() {
  const worker = new Worker<RenderJobData>(
    'render',
    async (job: Job<RenderJobData>) => {
      const { projectId, userId, exportId, resolution, includeSubtitles, backgroundMusicUrl } = job.data;
      logger.info(`[RenderWorker] Processing render job ${job.id} for project ${projectId}`);

      await publishProgress(projectId, {
        type: 'step_started',
        step: 'render-video',
        jobId: job.id,
        message: 'Starting video rendering pipeline...',
      });

      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');

      const [scenes, voice] = await Promise.all([
        Scene.find({ projectId }).sort({ order: 1 }),
        Voice.findOne({ projectId, isNarration: true, status: 'completed' }),
      ]);

      if (scenes.length === 0) throw new Error('No scenes found for project');

      const exportsDir = path.join(process.cwd(), 'exports', projectId);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const outputFileName = `render_${projectId}_${Date.now()}.mp4`;
      const localOutputPath = path.join(exportsDir, outputFileName);

      // Prepare subtitles file if enabled
      let srtPath: string | undefined;
      if (includeSubtitles && voice?.subtitles) {
        srtPath = path.join(exportsDir, `subtitles_${projectId}.srt`);
        fs.writeFileSync(srtPath, voice.subtitles.srt || '');
      }

      // Map scenes to RenderSceneInput
      const renderScenes: RenderSceneInput[] = scenes.map((s, index) => ({
        sceneNumber: s.sceneNumber || index + 1,
        mediaUrl: s.storyboardImageUrl || undefined,
        mediaType: 'image',
        durationSeconds: s.duration || 10,
        narrationAudioUrl: voice?.audioUrl || undefined,
        subtitleText: s.narration || undefined,
        motionEffect: index % 2 === 0 ? 'kenburns_zoom_in' : 'kenburns_zoom_out',
        transition: 'crossfade',
      }));

      // Run Render Engine pipeline
      const renderResult = await renderEngine.renderVideo({
        projectId,
        outputPath: localOutputPath,
        scenes: renderScenes,
        aspectRatio: project.aspectRatio || '16:9',
        resolution: resolution || '1080p',
        backgroundMusicUrl,
        backgroundMusicVolume: 0.15,
        enableAudioDucking: true,
        watermarkText: 'StoryForge AI',
        subtitlesSrtPath: srtPath,
        onProgress: async (percent, message) => {
          await job.updateProgress(percent);
          await publishProgress(projectId, {
            type: 'render_progress',
            progress: percent,
            message,
          });
        },
      });

      // Upload to Cloudinary if configured
      let finalVideoUrl = localOutputPath;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const uploadRes = await cloudinary.uploader.upload(localOutputPath, {
            resource_type: 'video',
            folder: `storyforge/renders/${projectId}`,
          });
          finalVideoUrl = uploadRes.secure_url;
        } catch (err) {
          logger.warn('[RenderWorker] Cloudinary upload failed — fallback to local URL:', (err as Error).message);
        }
      }

      // Save Export Document
      const exportDoc = await Export.create({
        _id: exportId,
        projectId,
        userId,
        status: 'completed',
        videoUrl: finalVideoUrl,
        resolution: renderResult.resolution,
        aspectRatio: project.aspectRatio,
        durationSeconds: renderResult.durationSeconds,
        fileSizeBytes: renderResult.fileSizeBytes,
        format: 'mp4',
        creditsUsed: 4,
      });

      // Update Project Status
      await Project.findByIdAndUpdate(projectId, {
        status: 'completed',
        exportId: exportDoc._id,
      });

      await publishProgress(projectId, {
        type: 'render_complete',
        step: 'render-video',
        jobId: job.id,
        data: {
          exportId: exportDoc._id,
          videoUrl: finalVideoUrl,
          durationSeconds: renderResult.durationSeconds,
          resolution: renderResult.resolution,
        },
        message: 'Video render completed successfully!',
      });

      return { exportId: exportDoc._id, videoUrl: finalVideoUrl };
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 2, // Max 2 video renders in parallel per node
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[RenderWorker] ✅ Render job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[RenderWorker] ❌ Render job ${job?.id} failed:`, err.message);
  });

  logger.info('[RenderWorker] 🎬 Render worker started (concurrency: 2)');
  return worker;
}
