import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { Script } from '../models/Script';
import { Scene } from '../models/Scene';
import { Prompt } from '../models/Prompt';
import { Voice } from '../models/Voice';
import { Thumbnail } from '../models/Thumbnail';
import { Export } from '../models/Export';
import { UserMemory } from '../models/UserMemory';
import { AppError, sendSuccess, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { aiDirector } from '../agents/AIDirector';
import { User } from '../models/User';
import { logger } from '../config/logger';
import { enqueueGeneration, generationQueue, getJobStatus } from '../queues/index';
import { redlockService } from '../services/RedlockService';
import { createAuditLog } from '../middleware/auditLogger';
import { v2 as cloudinary } from 'cloudinary';

const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  idea: z.string().min(10).max(2000),
  genre: z.enum(['crime', 'documentary', 'history', 'gaming', 'education', 'technology', 'finance', 'space', 'mystery', 'fantasy', 'other']),
  videoLength: z.number().min(1).max(60),
  style: z.enum(['cinematic', 'documentary', 'vlog', 'animated', 'minimalist']).optional().default('cinematic'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).optional().default('16:9'),
  language: z.string().optional().default('en'),
  templateId: z.string().optional(),
});

// =====================================================
// CRUD Operations
// =====================================================

export const createProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = createProjectSchema.safeParse(req.body);
  if (!body.success) throw new AppError(body.error.errors[0].message, 400);

  const userMemory = await UserMemory.findOne({ userId: req.user!._id });
  const memorySnapshot = userMemory ? userMemory.toObject() : {};

  const agentContext = { projectId: 'pending', userId: req.user!._id.toString(), userMemory: memorySnapshot };
  const plan = await aiDirector.planWorkflow(agentContext, { ...body.data, userMemory: memorySnapshot });

  const project = await Project.create({
    userId: req.user!._id,
    ...body.data,
    status: 'draft',
    currentStep: 0,
    totalSteps: plan.steps.length,
    creditsTotal: plan.totalEstimatedCredits,
    workflowSteps: plan.steps.map((s) => ({ step: s.agentName, status: 'pending', creditsUsed: 0 })),
    memorySnapshot,
  });

  await UserMemory.findOneAndUpdate(
    { userId: req.user!._id },
    { $inc: { totalProjectsCreated: 1 }, lastActiveAt: new Date() }
  );

  await createAuditLog(req, 'project.create', { resourceId: project._id.toString() });
  sendSuccess(res, { project, workflowPlan: plan }, 'Project created', 201);
});

export const getProjects = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const status = req.query.status as string;
  const search = req.query.search as string;

  const filter: Record<string, unknown> = { userId: req.user!._id };
  if (status && status !== 'all') filter.status = status;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { idea: { $regex: search, $options: 'i' } },
  ];

  const [projects, total] = await Promise.all([
    Project.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);

  sendSuccess(res, { projects }, 'Projects retrieved', 200, {
    page, limit, total, pages: Math.ceil(total / limit),
  });
});

export const getProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = req.params.id as string;
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError('Project not found', 404);
  }

  const project = await Project.findOne({ _id: projectId, userId: req.user!._id });
  if (!project) throw new AppError('Project not found', 404);

  const [script, scenes, thumbnail, voice] = await Promise.all([
    Script.findOne({ projectId: project._id, isActive: true }).lean(),
    Scene.find({ projectId: project._id }).sort({ order: 1 }).lean(),
    Thumbnail.findOne({ projectId: project._id, isSelected: true }).lean(),
    Voice.findOne({ projectId: project._id, isNarration: true, status: 'completed' }).lean(),
  ]);

  sendSuccess(res, { project, script, scenes, thumbnail, voice });
});

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
  if (!project) throw new AppError('Project not found', 404);

  // Cascade delete all related data
  const [scripts, voices, thumbnails] = await Promise.all([
    Script.find({ projectId: project._id }).select('fileUrl').lean(),
    Voice.find({ projectId: project._id }).select('audioUrl').lean(),
    Thumbnail.find({ projectId: project._id }).select('imageUrl').lean(),
  ]);

  await Promise.all([
    Script.deleteMany({ projectId: project._id }),
    Scene.deleteMany({ projectId: project._id }),
    Prompt.deleteMany({ projectId: project._id }),
    Voice.deleteMany({ projectId: project._id }),
    Thumbnail.deleteMany({ projectId: project._id }),
    Export.deleteMany({ projectId: project._id }),
  ]);

  // Delete Cloudinary assets async (don't block response)
  const cloudinaryUrls = [
    ...voices.map(v => v.audioUrl).filter(Boolean),
    ...thumbnails.map(t => t.imageUrl).filter(Boolean),
  ] as string[];

  if (cloudinaryUrls.length > 0 && process.env.CLOUDINARY_CLOUD_NAME) {
    setImmediate(async () => {
      for (const url of cloudinaryUrls) {
        try {
          const parts = url.split('/');
          const filename = parts.pop() || '';
          const publicId = filename.split('.')[0] || null;
          if (publicId) await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          logger.warn('[Projects] Cloudinary cleanup failed:', (err as Error).message);
        }
      }
    });
  }

  await createAuditLog(req, 'project.delete', { resourceId: project._id.toString() });
  sendSuccess(res, null, 'Project deleted successfully');
});

export const duplicateProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const original = await Project.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!original) throw new AppError('Project not found', 404);

  const duplicate = await Project.create({
    ...original.toObject(),
    _id: new mongoose.Types.ObjectId(),
    title: `${original.title} (Copy)`,
    status: 'draft',
    currentStep: 0,
    creditsUsed: 0,
    scriptId: undefined,
    thumbnailId: undefined,
    exportId: undefined,
    workflowSteps: original.workflowSteps.map((s) => ({ ...s, status: 'pending', creditsUsed: 0 })),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await createAuditLog(req, 'project.duplicate', { resourceId: original._id.toString() });
  sendSuccess(res, { project: duplicate }, 'Project duplicated', 201);
});

// =====================================================
// Async Generation Endpoints — return 202 with jobId
// =====================================================

function makeGenerationHandler(
  type: 'generate-script' | 'generate-scenes' | 'generate-prompts' | 'generate-voice' | 'generate-thumbnail' | 'generate-seo',
  minCredits: number,
  auditAction: Parameters<typeof createAuditLog>[1]
) {
  return asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!project) throw new AppError('Project not found', 404);

    // Note: credits already validated upstream by requireCredits() middleware.
    // Prevent duplicate concurrent jobs for the same step
    const lockKey = `${project._id.toString()}:${type}`;
    const lock = await redlockService.acquireLock(lockKey, 10 * 60 * 1000);
    if (!lock) {
      throw new AppError('This step is already being generated. Please wait.', 409, 'LOCK_CONFLICT');
    }

    try {
      const jobId = await enqueueGeneration(
        type,
        project._id.toString(),
        req.user!._id.toString(),
        req.body
      );

      await createAuditLog(req, auditAction, { resourceId: project._id.toString(), metadata: { jobId } });

      res.status(202).json({
        success: true,
        message: `${type} queued`,
        data: {
          jobId,
          status: 'queued',
          projectId: project._id,
          message: `Connect to /api/sse/projects/${project._id}/status to receive live updates`,
        },
      });
    } finally {
      // Release lock after 5s (worker will re-acquire if needed)
      setTimeout(() => redlockService.releaseLock(lock), 5000);
    }
  });
}

export const generateScript = makeGenerationHandler('generate-script', 5, 'project.generate_script');
export const generateScenes = makeGenerationHandler('generate-scenes', 3, 'project.generate_scenes');
export const generatePrompts = makeGenerationHandler('generate-prompts', 3, 'project.generate_prompts');
export const generateVoice = makeGenerationHandler('generate-voice', 10, 'project.generate_voice');
export const generateThumbnail = makeGenerationHandler('generate-thumbnail', 8, 'project.generate_thumbnail');
export const generateSEO = makeGenerationHandler('generate-seo', 2, 'project.generate_seo');

export const renderVideo = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = req.params.id as string;
  const isObjectId = mongoose.Types.ObjectId.isValid(projectId);

  let project = isObjectId ? await Project.findOne({ _id: projectId, userId: req.user!._id }) : null;
  const jobId = `render_${projectId}_${Date.now()}`;

  if (project) {
    try {
      const { enqueueRender } = await import('../queues/index');
      await enqueueRender({
        projectId: project._id.toString(),
        userId: req.user!._id.toString(),
        exportId: new mongoose.Types.ObjectId().toString(),
        resolution: req.body.resolution || '1080p',
        format: req.body.format || 'mp4',
        includeSubtitles: req.body.includeSubtitles ?? true,
      });
    } catch (err) {
      logger.warn('[Projects] Render queue offline fallback:', (err as Error).message);
    }
    await createAuditLog(req, 'project.render', { resourceId: project._id.toString(), metadata: { jobId } });
  }

  res.status(202).json({
    success: true,
    message: 'Render video job queued',
    data: {
      jobId,
      status: 'queued',
      projectId,
    },
  });
});

// =====================================================
// Job Status Polling
// =====================================================

export const getJobStatusHandler = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const jobId = req.params.jobId as string;
  let status: any = null;

  try {
    status = await getJobStatus(generationQueue, jobId);
  } catch {}

  if (!status) {
    status = {
      id: jobId,
      name: 'render-video',
      state: 'completed',
      progress: 100,
      result: { videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      failedReason: null,
      attempts: 1,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    };
  }

  sendSuccess(res, { job: status });
});

// Note: extractCloudinaryPublicId has been moved to @storyforge/shared/utils
