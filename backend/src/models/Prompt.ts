import mongoose, { Document, Schema } from 'mongoose';

export interface ICinematicPrompt {
  environment: string;
  characters: string;
  lighting: string;
  camera: string;
  lens: string;
  mood: string;
  action: string;
  colorGrading: string;
  resolution: string;
  negativePrompts: string;
  fullPrompt: string; // compiled final prompt
}

export interface IPrompt extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  sceneId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Prompt content
  type: 'image' | 'video' | 'character' | 'background';
  cinematic: ICinematicPrompt;
  promptText: string;
  negativePromptText: string;

  // Template reference
  templateId?: mongoose.Types.ObjectId;
  templateVersion?: number;

  // Quality
  qualityScore?: number;
  isApproved: boolean;

  // Versions
  version: number;
  parentVersionId?: mongoose.Types.ObjectId;

  provider: string;
  tokensUsed: number;

  createdAt: Date;
  updatedAt: Date;
}

const CinematicPromptSchema = new Schema<ICinematicPrompt>(
  {
    environment: { type: String, default: '' },
    characters: { type: String, default: '' },
    lighting: { type: String, default: '' },
    camera: { type: String, default: '' },
    lens: { type: String, default: '' },
    mood: { type: String, default: '' },
    action: { type: String, default: '' },
    colorGrading: { type: String, default: '' },
    resolution: { type: String, default: '4K' },
    negativePrompts: { type: String, default: '' },
    fullPrompt: { type: String, required: true },
  },
  { _id: false }
);

const PromptSchema = new Schema<IPrompt>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sceneId: { type: Schema.Types.ObjectId, ref: 'Scene', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['image', 'video', 'character', 'background'], default: 'video' },
    cinematic: { type: CinematicPromptSchema, required: true },
    promptText: { type: String, required: true },
    negativePromptText: { type: String, default: '' },
    templateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate' },
    templateVersion: { type: Number },
    qualityScore: { type: Number, min: 0, max: 100 },
    isApproved: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    parentVersionId: { type: Schema.Types.ObjectId, ref: 'Prompt' },
    provider: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PromptSchema.index({ projectId: 1, sceneId: 1 });

export const Prompt = mongoose.model<IPrompt>('Prompt', PromptSchema);
