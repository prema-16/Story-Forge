import mongoose, { Document, Schema } from 'mongoose';

export interface IExport extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Export type
  format: 'zip' | 'mp4' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';

  // Contents manifest
  includes: {
    script: boolean;
    scenes: boolean;
    prompts: boolean;
    voice: boolean;
    subtitlesSrt: boolean;
    subtitlesVtt: boolean;
    thumbnailPrompt: boolean;
    thumbnailImage: boolean;
    seoData: boolean;
    videoClips: boolean;
    metadata: boolean;
  };

  // Output
  videoUrl?: string;
  downloadUrl?: string;
  cloudinaryPublicId?: string;
  fileSizeMb?: number;
  expiresAt?: Date;

  // Processing
  errorMessage?: string;
  processingTimeMs?: number;
  bullJobId?: string;

  // YouTube SEO data snapshot
  seoSnapshot?: {
    title: string;
    description: string;
    tags: string[];
    hashtags: string[];
    keywords: string[];
    chapters: Array<{ time: string; title: string }>;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ExportSchema = new Schema<IExport>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    format: { type: String, enum: ['zip', 'mp4', 'json'], default: 'zip' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    includes: {
      script: { type: Boolean, default: true },
      scenes: { type: Boolean, default: true },
      prompts: { type: Boolean, default: true },
      voice: { type: Boolean, default: true },
      subtitlesSrt: { type: Boolean, default: true },
      subtitlesVtt: { type: Boolean, default: true },
      thumbnailPrompt: { type: Boolean, default: true },
      thumbnailImage: { type: Boolean, default: false },
      seoData: { type: Boolean, default: true },
      videoClips: { type: Boolean, default: false },
      metadata: { type: Boolean, default: true },
    },
    downloadUrl: { type: String },
    cloudinaryPublicId: { type: String },
    fileSizeMb: { type: Number },
    expiresAt: { type: Date },
    errorMessage: { type: String },
    processingTimeMs: { type: Number },
    bullJobId: { type: String },
    seoSnapshot: {
      title: { type: String },
      description: { type: String },
      tags: [{ type: String }],
      hashtags: [{ type: String }],
      keywords: [{ type: String }],
      chapters: [
        {
          time: { type: String },
          title: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

ExportSchema.index({ projectId: 1, status: 1 });
ExportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const Export = mongoose.model<IExport>('Export', ExportSchema);
