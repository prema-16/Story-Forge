import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';
import { GenerationJobData } from '../queues/index';
import { Project } from '../models/Project';
import { Script } from '../models/Script';
import { Scene } from '../models/Scene';
import { Prompt } from '../models/Prompt';
import { Voice } from '../models/Voice';
import { Thumbnail } from '../models/Thumbnail';
import { User } from '../models/User';
import { UserMemory } from '../models/UserMemory';
import { aiWriter } from '../agents/AIWriter';
import { aiScenePlanner } from '../agents/AIScenePlanner';
import { aiPromptEngineer } from '../agents/AIPromptEngineer';
import { aiVoiceDirector } from '../agents/AIVoiceDirector';
import { aiThumbnailDesigner, aiSEOSpecialist } from '../agents/AISpecialists';
import { publishProgress } from '../services/PubSubService';

type StepHandler = (job: Job<GenerationJobData>) => Promise<Record<string, unknown>>;

const stepHandlers: Record<GenerationJobData['type'], StepHandler> = {
  'generate-script': handleGenerateScript,
  'generate-scenes': handleGenerateScenes,
  'generate-prompts': handleGeneratePrompts,
  'generate-voice': handleGenerateVoice,
  'generate-thumbnail': handleGenerateThumbnail,
  'generate-seo': handleGenerateSEO,
};

// =====================================================
// Worker Instance
// =====================================================

export function startGenerationWorker() {
  const worker = new Worker<GenerationJobData>(
    'generation',
    async (job) => {
      logger.info(`[Worker] Processing ${job.name} → project ${job.data.projectId}`);
      await publishProgress(job.data.projectId, {
        type: 'step_started',
        step: job.data.type,
        jobId: job.id,
        message: `Starting ${job.data.type}...`,
      });

      try {
        const handler = stepHandlers[job.data.type];
        if (!handler) throw new Error(`Unknown job type: ${job.data.type}`);

        const result = await handler(job);

        await publishProgress(job.data.projectId, {
          type: 'step_completed',
          step: job.data.type,
          jobId: job.id,
          data: result,
          message: `${job.data.type} completed`,
        });

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`[Worker] ${job.data.type} failed for ${job.data.projectId}: ${message}`);

        await publishProgress(job.data.projectId, {
          type: 'step_failed',
          step: job.data.type,
          jobId: job.id,
          error: message,
        });

        // Mark step as failed in DB
        await Project.findByIdAndUpdate(job.data.projectId, {
          status: 'failed',
          [`workflowSteps.$[step].status`]: 'failed',
          [`workflowSteps.$[step].errorMessage`]: message,
          [`workflowSteps.$[step].completedAt`]: new Date(),
        }, { arrayFilters: [{ 'step.step': job.data.type.replace('generate-', 'ai-') }] });

        throw err;
      }
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 5,
      limiter: { max: 10, duration: 60000 }, // max 10 jobs/min globally
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[Worker] ✅ Job ${job.id} (${job.name}) completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Worker] ❌ Job ${job?.id} (${job?.name}) failed:`, err.message);
  });

  let loggedWorkerError = false;
  worker.on('error', (err) => {
    if (!loggedWorkerError) {
      logger.warn('[Worker] BullMQ queue waiting for Redis connection...');
      loggedWorkerError = true;
    }
  });

  logger.info('[Worker] 🚀 Generation worker started (concurrency: 5)');
  return worker;
}

// =====================================================
// Individual Step Handlers
// =====================================================

async function handleGenerateScript(job: Job<GenerationJobData>): Promise<Record<string, unknown>> {
  const { projectId, userId } = job.data;

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const userMemory = await UserMemory.findOne({ userId });

  await markStepRunning(projectId, 'ai-writer');
  await job.updateProgress(10);

  const context = {
    projectId,
    userId,
    userMemory: userMemory ? (userMemory.toObject() as unknown as Record<string, unknown>) : undefined,
    preferredTextProvider: userMemory?.preferredTextProvider ?? undefined,
  };

  const result = await aiWriter.run(context, {
    idea: project.idea,
    genre: project.genre,
    videoLength: project.videoLength,
    style: project.style,
    language: project.language,
    tone: 'informative',
  });

  if (!result.success) throw new Error(result.error ?? 'Script generation failed');

  const scriptData = result.data as any;

  await job.updateProgress(70);

  await Script.updateMany({ projectId: project._id }, { isActive: false });

  const script = await Script.create({
    projectId: project._id,
    userId,
    ...scriptData,
    provider: result.provider,
    model: result.provider === 'mock' ? 'mock' : 'gpt-4o',
    tokensUsed: result.tokensUsed,
    version: 1,
    isActive: true,
  });

  const creditsUsed = 5;
  await deductCredits(projectId, userId, creditsUsed, 'ai-writer', result.provider);

  await job.updateProgress(100);

  return { script: script.toObject(), creditsUsed, latencyMs: result.latencyMs };
}

async function getOrCreateScript(projectId: mongoose.Types.ObjectId, userId: string, projectTitle: string, idea: string) {
  let script = await Script.findOne({ projectId, isActive: true });
  if (!script) script = await Script.findOne({ projectId });
  if (!script) {
    script = await Script.create({
      projectId,
      userId,
      title: projectTitle || 'AI YouTube Video',
      introduction: idea || 'Welcome to this AI-generated video demonstration.',
      chapters: [
        {
          number: 1,
          title: 'Main Chapter',
          content: idea || 'Exploring key concepts and ideas.',
          duration: 60,
          wordCount: 80,
        },
      ],
      ending: 'Thank you for watching.',
      outro: 'Subscribe to StoryForge AI.',
      totalWordCount: 100,
      estimatedDuration: 60,
      provider: 'mock',
      model: 'mock',
      tokensUsed: 100,
      version: 1,
      isActive: true,
    });
  }
  return script;
}

async function handleGenerateScenes(job: Job<GenerationJobData>): Promise<Record<string, unknown>> {
  const { projectId, userId } = job.data;

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const script = await getOrCreateScript(project._id as mongoose.Types.ObjectId, userId, project.title, project.idea);

  const userMemory = await UserMemory.findOne({ userId });
  await markStepRunning(projectId, 'ai-scene-planner');
  await job.updateProgress(10);

  const result = await aiScenePlanner.run(
    { projectId, userId, userMemory: userMemory ? (userMemory.toObject() as unknown as Record<string, unknown>) : undefined },
    {
      script: { title: script.title, introduction: script.introduction, chapters: script.chapters, ending: script.ending },
      genre: project.genre,
      style: project.style,
      videoLength: project.videoLength,
    }
  );

  if (!result.success) throw new Error(result.error ?? 'Scene generation failed');

  const rawData = result.data as any;
  let sceneData: any[] = [];
  if (Array.isArray(rawData)) {
    sceneData = rawData;
  } else if (rawData && Array.isArray(rawData.scenes)) {
    sceneData = rawData.scenes;
  } else if (rawData && Array.isArray(rawData.data)) {
    sceneData = rawData.data;
  }

  if (!sceneData || sceneData.length === 0) {
    logger.warn(`[handleGenerateScenes] Could not parse scenes array from result data, generating fallback scenes.`);
    sceneData = [
      {
        sceneNumber: 1,
        title: 'Opening Scene',
        duration: 15,
        narration: script.introduction || project.idea || 'Welcome to this video.',
        visualDescription: 'Cinematic wide shot with vibrant lighting and 8k detail.',
        cameraMovement: 'Slow push in',
        soundEffects: ['ambient atmospheric hum'],
        backgroundMusic: 'Cinematic documentary soundtrack',
        mood: 'dramatic',
        order: 1,
      },
      {
        sceneNumber: 2,
        title: 'Core Concept',
        duration: 30,
        narration: script.chapters?.[0]?.content || project.idea || 'Deep dive into the primary topic.',
        visualDescription: 'Dynamic medium shot showcasing core story elements.',
        cameraMovement: 'Tracking shot',
        soundEffects: ['subtle cinematic riser'],
        backgroundMusic: 'Cinematic documentary soundtrack',
        mood: 'informative',
        order: 2,
      },
      {
        sceneNumber: 3,
        title: 'Conclusion & Summary',
        duration: 15,
        narration: script.ending || 'Thank you for watching.',
        visualDescription: 'Inspiring cinematic closing shot.',
        cameraMovement: 'Pan right',
        soundEffects: ['soft chime'],
        backgroundMusic: 'Warm emotional outro music',
        mood: 'hopeful',
        order: 3,
      },
    ];
  }

  await job.updateProgress(60);

  await Scene.deleteMany({ projectId: project._id });
  const scenes = await Scene.insertMany(
    sceneData.map((s: any, idx: number) => ({
      ...s,
      sceneNumber: s.sceneNumber || idx + 1,
      order: s.order || idx + 1,
      projectId: project._id,
      scriptId: script._id,
      userId,
    }))
  );

  const creditsUsed = 3;
  await deductCredits(projectId, userId, creditsUsed, 'ai-scene-planner', result.provider);

  await job.updateProgress(100);

  return { scenes: scenes.map(s => s.toObject()), creditsUsed };
}

async function handleGeneratePrompts(job: Job<GenerationJobData>): Promise<Record<string, unknown>> {
  const { projectId, userId } = job.data;

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  let scenes = await Scene.find({ projectId: project._id }).sort({ order: 1 });
  if (scenes.length === 0) {
    const scene = await Scene.create({
      projectId: project._id,
      userId,
      sceneNumber: 1,
      title: 'Opening Scene',
      duration: 10,
      narration: project.idea || 'Welcome to the scene visualizer.',
      visualDescription: 'Cinematic, vibrant 8K photorealistic scene.',
      cameraMovement: 'Slow push in',
      soundEffects: ['ambient chime'],
      backgroundMusic: 'cinematic soundtrack',
      mood: 'inspiring',
      order: 1,
      status: 'completed',
    });
    scenes = [scene];
  }

  const userMemory = await UserMemory.findOne({ userId });
  const context = { projectId, userId, userMemory: userMemory ? (userMemory.toObject() as unknown as Record<string, unknown>) : undefined };

  await markStepRunning(projectId, 'ai-prompt-engineer');

  const promptResults: any[] = [];
  const batchSize = 3;

  for (let i = 0; i < scenes.length; i += batchSize) {
    const batch = scenes.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((scene) =>
        aiPromptEngineer.run(context, {
          scene: {
            sceneNumber: scene.sceneNumber,
            title: scene.title,
            visualDescription: scene.visualDescription,
            cameraMovement: scene.cameraMovement,
            mood: scene.mood,
            location: scene.location,
            timeOfDay: scene.timeOfDay,
          },
          genre: project.genre,
          style: project.style,
          aspectRatio: project.aspectRatio,
        })
      )
    );
    promptResults.push(...batchResults);
    await job.updateProgress(Math.round(((i + batchSize) / scenes.length) * 80));
  }

  await Prompt.deleteMany({ projectId: project._id });

  const savedPrompts = await Promise.all(
    promptResults.map(async (r, i) => {
      if (!r.success) return null;
      const promptData = r.data as any;
      const prompt = await Prompt.create({
        projectId: project._id,
        sceneId: scenes[i]._id,
        userId,
        type: 'video',
        cinematic: promptData,
        promptText: promptData.fullPrompt,
        negativePromptText: promptData.negativePrompts,
        provider: r.provider,
        tokensUsed: r.tokensUsed,
        version: 1,
      });
      await Scene.findByIdAndUpdate(scenes[i]._id, { promptId: prompt._id });
      return prompt;
    })
  );

  const creditsUsed = 3;
  await deductCredits(projectId, userId, creditsUsed, 'ai-prompt-engineer', 'mixed');
  await job.updateProgress(100);

  return { prompts: savedPrompts.filter(Boolean), creditsUsed };
}

async function handleGenerateVoice(job: Job<GenerationJobData>): Promise<Record<string, unknown>> {
  const { projectId, userId, payload } = job.data;

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const script = await getOrCreateScript(project._id as mongoose.Types.ObjectId, userId, project.title, project.idea);
  const userMemory = await UserMemory.findOne({ userId });

  const fullNarration = [
    script.introduction,
    ...script.chapters.map((c) => c.content),
    script.ending,
  ].join('\n\n');

  await markStepRunning(projectId, 'ai-voice-director');
  await job.updateProgress(10);

  const result = await aiVoiceDirector.run(
    { projectId, userId, userMemory: userMemory ? (userMemory.toObject() as unknown as Record<string, unknown>) : undefined },
    {
      text: fullNarration,
      voiceId: payload?.voiceId ?? 'mock-rachel',
      voiceName: payload?.voiceName ?? 'Rachel',
      provider: payload?.provider,
      speed: payload?.speed ?? 1.0,
      emotion: payload?.emotion ?? 'neutral',
      language: project.language,
      projectId,
    }
  );

  if (!result.success) throw new Error(result.error ?? 'Voice generation failed');

  const voiceData = result.data as any;
  await job.updateProgress(70);

  await Voice.deleteMany({ projectId: project._id, isNarration: true });

  const voice = await Voice.create({
    projectId: project._id,
    userId,
    voiceId: voiceData.voiceId,
    voiceName: voiceData.voiceName,
    provider: voiceData.provider,
    text: fullNarration,
    wordCount: fullNarration.split(/\s+/).length,
    durationSeconds: voiceData.durationSeconds,
    status: 'completed',
    audioUrl: voiceData.audioUrl,
    waveformData: voiceData.waveformData,
    subtitles: voiceData.subtitles,
    isNarration: true,
    creditsUsed: voiceData.creditsUsed,
  });

  await deductCredits(projectId, userId, voiceData.creditsUsed, 'ai-voice-director', voiceData.provider);
  await job.updateProgress(100);

  return { voice: voice.toObject(), creditsUsed: voiceData.creditsUsed };
}

async function handleGenerateThumbnail(job: Job<GenerationJobData>): Promise<Record<string, unknown>> {
  const { projectId, userId } = job.data;

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const script = await getOrCreateScript(project._id as mongoose.Types.ObjectId, userId, project.title, project.idea);
  const userMemory = await UserMemory.findOne({ userId });

  await markStepRunning(projectId, 'ai-thumbnail-designer');
  await job.updateProgress(10);

  const result = await aiThumbnailDesigner.run(
    { projectId, userId, userMemory: userMemory ? (userMemory.toObject() as unknown as Record<string, unknown>) : undefined },
    {
      scriptTitle: script.title,
      genre: project.genre,
      style: project.style,
      targetAudience: userMemory?.targetAudience,
    }
  );

  if (!result.success) throw new Error(result.error ?? 'Thumbnail generation failed');

  const thumbData = result.data as any;
  await job.updateProgress(80);

  const thumbnail = await Thumbnail.create({
    projectId: project._id,
    userId,
    ...thumbData,
    provider: result.provider,
    isSelected: true,
    creditsUsed: 8,
  });

  await Project.findByIdAndUpdate(projectId, { thumbnailId: thumbnail._id });
  await deductCredits(projectId, userId, 8, 'ai-thumbnail-designer', result.provider);
  await job.updateProgress(100);

  return { thumbnail: thumbnail.toObject(), creditsUsed: 8 };
}

async function handleGenerateSEO(job: Job<GenerationJobData>): Promise<Record<string, unknown>> {
  const { projectId, userId } = job.data;

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const script = await getOrCreateScript(project._id as mongoose.Types.ObjectId, userId, project.title, project.idea);
  const scenes = await Scene.find({ projectId: project._id }).sort({ order: 1 });
  const userMemory = await UserMemory.findOne({ userId });

  await markStepRunning(projectId, 'ai-seo-specialist');
  await job.updateProgress(10);

  const result = await aiSEOSpecialist.run(
    { projectId, userId, userMemory: userMemory ? (userMemory.toObject() as unknown as Record<string, unknown>) : undefined },
    {
      scriptTitle: script.title,
      scriptSummary: script.introduction,
      genre: project.genre,
      scenes: scenes.map((s) => ({ title: s.title, duration: s.duration })),
    }
  );

  if (!result.success) throw new Error(result.error ?? 'SEO generation failed');

  await deductCredits(projectId, userId, 2, 'ai-seo-specialist', result.provider);
  await job.updateProgress(100);

  return { seo: result.data, creditsUsed: 2 };
}

// =====================================================
// Shared helpers
// =====================================================

async function markStepRunning(projectId: string, stepName: string) {
  await Project.findByIdAndUpdate(projectId, {
    status: 'generating',
    [`workflowSteps.$[step].status`]: 'running',
    [`workflowSteps.$[step].startedAt`]: new Date(),
  }, { arrayFilters: [{ 'step.step': stepName }] });
}

async function deductCredits(
  projectId: string,
  userId: string,
  credits: number,
  step: string,
  provider: string
) {
  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Project.findByIdAndUpdate(
          projectId,
          {
            $inc: { creditsUsed: credits },
            [`workflowSteps.$[step].status`]: 'completed',
            [`workflowSteps.$[step].completedAt`]: new Date(),
            [`workflowSteps.$[step].creditsUsed`]: credits,
            [`workflowSteps.$[step].provider`]: provider,
          },
          { arrayFilters: [{ 'step.step': step }], session }
        );
        await User.findByIdAndUpdate(
          userId,
          { $inc: { credits: -credits, creditsUsed: credits } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  } catch (err) {
    // Fallback for standalone MongoDB instances without replica set transactions
    await Project.findByIdAndUpdate(
      projectId,
      {
        $inc: { creditsUsed: credits },
        [`workflowSteps.$[step].status`]: 'completed',
        [`workflowSteps.$[step].completedAt`]: new Date(),
        [`workflowSteps.$[step].creditsUsed`]: credits,
        [`workflowSteps.$[step].provider`]: provider,
      },
      { arrayFilters: [{ 'step.step': step }] }
    );
    await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -credits, creditsUsed: credits } }
    );
  }
}

export async function runGenerationStepInline(
  type: GenerationJobData['type'],
  projectId: string,
  userId: string,
  payload?: Record<string, unknown>,
  jobId?: string
): Promise<Record<string, unknown>> {
  const actualJobId = jobId || `${projectId}:${type}:${Date.now()}`;
  logger.info(`[InlineWorker] Executing ${type} inline for project ${projectId}`);

  await publishProgress(projectId, {
    type: 'step_started',
    step: type,
    jobId: actualJobId,
    message: `Starting ${type}...`,
  });

  const mockJob: any = {
    id: actualJobId,
    data: { type, projectId, userId, payload },
    updateProgress: async (p: number) => {
      const { inlineJobs } = await import('../queues/index');
      const existing = inlineJobs.get(actualJobId);
      if (existing) {
        existing.progress = p;
        inlineJobs.set(actualJobId, existing);
      }
      await publishProgress(projectId, {
        type: 'step_progress',
        step: type,
        jobId: actualJobId,
        progress: p,
      });
    },
  };

  try {
    const handler = stepHandlers[type];
    if (!handler) throw new Error(`Unknown job type: ${type}`);

    const result = await handler(mockJob);

    const { inlineJobs } = await import('../queues/index');
    inlineJobs.set(actualJobId, {
      id: actualJobId,
      name: type,
      state: 'completed',
      progress: 100,
      result,
      failedReason: null,
      attempts: 1,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });

    await publishProgress(projectId, {
      type: 'step_completed',
      step: type,
      jobId: actualJobId,
      data: result,
      message: `${type} completed`,
    });

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[InlineWorker] ${type} failed for ${projectId}: ${message}`);

    const { inlineJobs } = await import('../queues/index');
    inlineJobs.set(actualJobId, {
      id: actualJobId,
      name: type,
      state: 'failed',
      progress: 0,
      result: null,
      failedReason: message,
      attempts: 1,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });

    await publishProgress(projectId, {
      type: 'step_failed',
      step: type,
      jobId: actualJobId,
      error: message,
    });

    await Project.findByIdAndUpdate(
      projectId,
      {
        status: 'failed',
        [`workflowSteps.$[step].status`]: 'failed',
        [`workflowSteps.$[step].errorMessage`]: message,
        [`workflowSteps.$[step].completedAt`]: new Date(),
      },
      { arrayFilters: [{ 'step.step': type.replace('generate-', 'ai-') }] }
    );

    throw err;
  }
}
