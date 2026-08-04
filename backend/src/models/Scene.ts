import mongoose, { Document, Schema } from 'mongoose';

export type SceneStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface IScene extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  scriptId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Scene content
  sceneNumber: number;
  title: string;
  duration: number; // seconds
  narration: string;
  visualDescription: string;
  cameraMovement: string;
  soundEffects: string[];
  backgroundMusic: string;
  location: string;
  timeOfDay: string;
  mood: string;

  // Generated assets
  promptId?: mongoose.Types.ObjectId;
  voiceId?: mongoose.Types.ObjectId;
  videoId?: mongoose.Types.ObjectId;
  storyboardImageUrl?: string;

  // Status
  status: SceneStatus;
  qualityScore?: number;
  qaFeedback?: string;

  // Order
  order: number;
  isLocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const SceneSchema = new Schema<IScene>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    scriptId: { type: Schema.Types.ObjectId, ref: 'Script', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sceneNumber: { type: Number, required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    narration: { type: String, required: true },
    visualDescription: { type: String, required: true },
    cameraMovement: { type: String, default: 'static' },
    soundEffects: [{ type: String }],
    backgroundMusic: { type: String, default: '' },
    location: { type: String, default: '' },
    timeOfDay: { type: String, default: '' },
    mood: { type: String, default: '' },
    promptId: { type: Schema.Types.ObjectId, ref: 'Prompt' },
    voiceId: { type: Schema.Types.ObjectId, ref: 'Voice' },
    videoId: { type: Schema.Types.ObjectId, ref: 'Video' },
    storyboardImageUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    qualityScore: { type: Number, min: 0, max: 100 },
    qaFeedback: { type: String },
    order: { type: Number, required: true },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SceneSchema.index({ projectId: 1, order: 1 });
SceneSchema.index({ status: 1 });

export const Scene = mongoose.model<IScene>('Scene', SceneSchema);
