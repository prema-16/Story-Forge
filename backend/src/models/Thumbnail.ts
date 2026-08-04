import mongoose, { Document, Schema } from 'mongoose';

export interface IThumbnail extends Omit<Document, 'isSelected'> {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Prompt details
  titleText: string;
  composition: string;
  colorPalette: string[];
  textPlacement: string;
  backgroundPrompt: string;
  subjectPrompt: string;
  moodPrompt: string;
  fullPrompt: string;
  negativePrompt: string;

  // CTR optimization
  clickThroughScore?: number;
  visualHooks: string[];

  // Generated assets
  imageUrl?: string;
  cloudinaryPublicId?: string;
  variants: Array<{
    imageUrl: string;
    cloudinaryPublicId: string;
    prompt: string;
    selected: boolean;
  }>;

  // Metadata
  provider: string; // dalle | stability | ideogram
  isSelected: boolean;
  creditsUsed: number;

  createdAt: Date;
  updatedAt: Date;
}

const ThumbnailSchema = new Schema<IThumbnail>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    titleText: { type: String, required: true },
    composition: { type: String, required: true },
    colorPalette: [{ type: String }],
    textPlacement: { type: String, default: 'bottom-center' },
    backgroundPrompt: { type: String, default: '' },
    subjectPrompt: { type: String, default: '' },
    moodPrompt: { type: String, default: '' },
    fullPrompt: { type: String, required: true },
    negativePrompt: { type: String, default: '' },
    clickThroughScore: { type: Number, min: 0, max: 100 },
    visualHooks: [{ type: String }],
    imageUrl: { type: String },
    cloudinaryPublicId: { type: String },
    variants: [
      {
        imageUrl: { type: String, required: true },
        cloudinaryPublicId: { type: String, required: true },
        prompt: { type: String, required: true },
        selected: { type: Boolean, default: false },
      },
    ],
    provider: { type: String, required: true },
    isSelected: { type: Boolean, default: false },
    creditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ThumbnailSchema.index({ projectId: 1 });

export const Thumbnail = mongoose.model<IThumbnail>('Thumbnail', ThumbnailSchema);
