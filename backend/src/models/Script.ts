import mongoose, { Document, Schema } from 'mongoose';

export interface ScriptChapter {
  number: number;
  title: string;
  content: string;
  duration: number; // seconds
  wordCount: number;
}

export interface IScript extends Omit<Document, 'model'> {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Generated content
  title: string;
  introduction: string;
  chapters: ScriptChapter[];
  ending: string;
  outro: string;

  // Metadata
  totalWordCount: number;
  estimatedDuration: number; // seconds
  readingLevel: string;
  tone: string;

  // Provider info
  provider: string;
  model: string;
  tokensUsed: number;

  // Versions
  version: number;
  isActive: boolean;
  parentVersionId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ScriptChapterSchema = new Schema<ScriptChapter>(
  {
    number: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    duration: { type: Number, required: true },
    wordCount: { type: Number, required: true },
  },
  { _id: false }
);

const ScriptSchema = new Schema<IScript>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    introduction: { type: String, required: true },
    chapters: [ScriptChapterSchema],
    ending: { type: String, required: true },
    outro: { type: String, required: true },
    totalWordCount: { type: Number, default: 0 },
    estimatedDuration: { type: Number, default: 0 },
    readingLevel: { type: String, default: 'general' },
    tone: { type: String, default: 'informative' },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    parentVersionId: { type: Schema.Types.ObjectId, ref: 'Script' },
  },
  { timestamps: true }
);

ScriptSchema.index({ projectId: 1, version: -1 });

export const Script = mongoose.model<IScript>('Script', ScriptSchema);
