import mongoose, { Document, Schema } from 'mongoose';

export type TemplateCategory =
  | 'crime'
  | 'history'
  | 'gaming'
  | 'education'
  | 'technology'
  | 'finance'
  | 'documentary'
  | 'space'
  | 'mystery'
  | 'fantasy'
  | 'general';

export interface IPromptTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;

  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];

  // Template bodies (with {{variables}})
  scriptTemplate: string;
  sceneTemplate: string;
  promptTemplate: string;
  thumbnailTemplate: string;
  seoTemplate: string;

  // Default settings
  defaultGenre: string;
  defaultStyle: string;
  defaultTone: string;
  defaultVideoLength: number;

  // Example output
  exampleOutput?: {
    scriptTitle: string;
    firstScene: string;
    thumbnailPrompt: string;
  };

  // Versioning
  version: number;
  parentTemplateId?: mongoose.Types.ObjectId;

  // Sharing
  isPublic: boolean;
  isOfficial: boolean; // curated by StoryForge team
  usageCount: number;
  rating: number;
  ratingCount: number;

  // Metadata
  isActive: boolean;
  language: string;

  createdAt: Date;
  updatedAt: Date;
}

const PromptTemplateSchema = new Schema<IPromptTemplate>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['crime', 'history', 'gaming', 'education', 'technology', 'finance', 'documentary', 'space', 'mystery', 'fantasy', 'general'],
      required: true,
    },
    tags: [{ type: String }],
    scriptTemplate: { type: String, required: true },
    sceneTemplate: { type: String, required: true },
    promptTemplate: { type: String, required: true },
    thumbnailTemplate: { type: String, default: '' },
    seoTemplate: { type: String, default: '' },
    defaultGenre: { type: String, default: 'documentary' },
    defaultStyle: { type: String, default: 'cinematic' },
    defaultTone: { type: String, default: 'informative' },
    defaultVideoLength: { type: Number, default: 10 },
    exampleOutput: {
      scriptTitle: { type: String },
      firstScene: { type: String },
      thumbnailPrompt: { type: String },
    },
    version: { type: Number, default: 1 },
    parentTemplateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate' },
    isPublic: { type: Boolean, default: false },
    isOfficial: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

PromptTemplateSchema.index({ category: 1, isPublic: 1 });
PromptTemplateSchema.index({ tags: 1 });
PromptTemplateSchema.index({ usageCount: -1 });
PromptTemplateSchema.index({ rating: -1 });

export const PromptTemplate = mongoose.model<IPromptTemplate>('PromptTemplate', PromptTemplateSchema);
