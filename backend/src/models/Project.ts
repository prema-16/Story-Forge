import mongoose, { Document, Schema } from 'mongoose';

export type ProjectStatus =
  | 'draft'
  | 'generating'
  | 'review'
  | 'completed'
  | 'failed'
  | 'archived';

export type VideoGenre =
  | 'crime'
  | 'documentary'
  | 'history'
  | 'gaming'
  | 'education'
  | 'technology'
  | 'finance'
  | 'space'
  | 'mystery'
  | 'fantasy'
  | 'other';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type VideoStyle = 'cinematic' | 'documentary' | 'vlog' | 'animated' | 'minimalist';

export interface WorkflowStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  creditsUsed: number;
  provider?: string;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  idea: string;
  genre: VideoGenre;
  videoLength: number; // in minutes
  style: VideoStyle;
  aspectRatio: AspectRatio;
  language: string;
  status: ProjectStatus;
  currentStep: number;
  totalSteps: number;
  workflowSteps: WorkflowStep[];
  creditsTotal: number;
  creditsUsed: number;

  // References to generated content
  scriptId?: mongoose.Types.ObjectId;
  thumbnailId?: mongoose.Types.ObjectId;
  exportId?: mongoose.Types.ObjectId;

  // User memory snapshot at project creation
  memorySnapshot?: Record<string, unknown>;

  // Metadata
  qualityScore?: number;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  templateId?: mongoose.Types.ObjectId;

  // History for undo
  history: Array<{
    action: string;
    timestamp: Date;
    snapshot: Record<string, unknown>;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

const WorkflowStepSchema = new Schema<WorkflowStep>(
  {
    step: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'skipped'],
      default: 'pending',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    errorMessage: { type: String },
    creditsUsed: { type: Number, default: 0 },
    provider: { type: String },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    idea: { type: String, required: true, maxlength: 2000 },
    genre: {
      type: String,
      enum: ['crime', 'documentary', 'history', 'gaming', 'education', 'technology', 'finance', 'space', 'mystery', 'fantasy', 'other'],
      default: 'documentary',
    },
    videoLength: { type: Number, required: true, min: 1, max: 60 },
    style: {
      type: String,
      enum: ['cinematic', 'documentary', 'vlog', 'animated', 'minimalist'],
      default: 'cinematic',
    },
    aspectRatio: { type: String, enum: ['16:9', '9:16', '1:1', '4:3'], default: '16:9' },
    language: { type: String, default: 'en' },
    status: {
      type: String,
      enum: ['draft', 'generating', 'review', 'completed', 'failed', 'archived'],
      default: 'draft',
    },
    currentStep: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 9 },
    workflowSteps: [WorkflowStepSchema],
    creditsTotal: { type: Number, default: 0 },
    creditsUsed: { type: Number, default: 0 },
    scriptId: { type: Schema.Types.ObjectId, ref: 'Script' },
    thumbnailId: { type: Schema.Types.ObjectId, ref: 'Thumbnail' },
    exportId: { type: Schema.Types.ObjectId, ref: 'Export' },
    memorySnapshot: { type: Schema.Types.Mixed },
    qualityScore: { type: Number, min: 0, max: 100 },
    tags: [{ type: String }],
    isFavorite: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    templateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate' },
    history: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        snapshot: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ tags: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
