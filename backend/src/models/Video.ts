import mongoose, { Document, Schema } from 'mongoose';

export type VideoClipStatus = 'pending' | 'queued' | 'generating' | 'completed' | 'failed';

export interface IVideo extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  sceneId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Generation config
  provider: string; // runway | kling | pika | luma | mock
  providerJobId?: string;
  promptId: mongoose.Types.ObjectId;
  promptText: string;
  negativePrompt: string;

  // Settings
  durationSeconds: number;
  aspectRatio: string;
  resolution: string;
  fps: number;

  // Status
  status: VideoClipStatus;
  progress: number; // 0–100
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;

  // Output
  videoUrl?: string;
  cloudinaryPublicId?: string;
  thumbnailUrl?: string;
  fileSizeMb?: number;

  // Metadata
  creditsUsed: number;
  generationTimeMs?: number;

  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sceneId: { type: Schema.Types.ObjectId, ref: 'Scene', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, required: true },
    providerJobId: { type: String },
    promptId: { type: Schema.Types.ObjectId, ref: 'Prompt', required: true },
    promptText: { type: String, required: true },
    negativePrompt: { type: String, default: '' },
    durationSeconds: { type: Number, required: true },
    aspectRatio: { type: String, default: '16:9' },
    resolution: { type: String, default: '1920x1080' },
    fps: { type: Number, default: 24 },
    status: {
      type: String,
      enum: ['pending', 'queued', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    videoUrl: { type: String },
    cloudinaryPublicId: { type: String },
    thumbnailUrl: { type: String },
    fileSizeMb: { type: Number },
    creditsUsed: { type: Number, default: 0 },
    generationTimeMs: { type: Number },
  },
  { timestamps: true }
);

VideoSchema.index({ projectId: 1, status: 1 });
VideoSchema.index({ providerJobId: 1 }, { sparse: true });

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
