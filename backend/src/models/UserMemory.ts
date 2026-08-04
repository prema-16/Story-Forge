import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMemory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Writing & Content Preferences
  writingStyle: string; // e.g., "formal, academic, storytelling"
  preferredTone: string;
  preferredGenres: string[];
  preferredLanguage: string;

  // Voice Preferences
  preferredVoiceId: string;
  preferredVoiceName: string;
  preferredSpeechSpeed: number;
  preferredSpeechEmotion: string;

  // Visual Preferences
  preferredThumbnailStyle: string;
  preferredColorPalette: string[];
  brandColors: string[];
  preferredVideoStyle: string;

  // AI Provider Preferences
  preferredTextProvider: string;
  preferredImageProvider: string;
  preferredVideoProvider: string;
  preferredVoiceProvider: string;
  preferredTextModel: string;

  // Prompt Preferences
  promptStyle: string; // cinematic | minimal | detailed
  preferredCameraStyle: string;
  preferredLighting: string;
  preferredColorGrading: string;

  // Project Defaults
  defaultAspectRatio: string;
  defaultVideoLength: number;
  defaultIntroText: string;
  defaultOutroText: string;

  // Channel / Brand
  channelName: string;
  channelDescription: string;
  channelKeywords: string[];
  targetAudience: string;

  // Analytics
  totalProjectsCreated: number;
  totalCreditsUsed: number;
  averageQualityScore: number;
  favoriteGenre: string;
  lastActiveAt: Date;

  // Learning
  styleEvolutions: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    reason: string;
    timestamp: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

const UserMemorySchema = new Schema<IUserMemory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    writingStyle: { type: String, default: '' },
    preferredTone: { type: String, default: 'informative' },
    preferredGenres: [{ type: String }],
    preferredLanguage: { type: String, default: 'en' },

    preferredVoiceId: { type: String, default: '' },
    preferredVoiceName: { type: String, default: '' },
    preferredSpeechSpeed: { type: Number, default: 1.0 },
    preferredSpeechEmotion: { type: String, default: 'neutral' },

    preferredThumbnailStyle: { type: String, default: '' },
    preferredColorPalette: [{ type: String }],
    brandColors: [{ type: String }],
    preferredVideoStyle: { type: String, default: 'cinematic' },

    preferredTextProvider: { type: String, default: 'openai' },
    preferredImageProvider: { type: String, default: 'dalle' },
    preferredVideoProvider: { type: String, default: 'mock' },
    preferredVoiceProvider: { type: String, default: 'mock' },
    preferredTextModel: { type: String, default: 'gpt-4o' },

    promptStyle: { type: String, default: 'cinematic' },
    preferredCameraStyle: { type: String, default: '' },
    preferredLighting: { type: String, default: '' },
    preferredColorGrading: { type: String, default: '' },

    defaultAspectRatio: { type: String, default: '16:9' },
    defaultVideoLength: { type: Number, default: 10 },
    defaultIntroText: { type: String, default: '' },
    defaultOutroText: { type: String, default: '' },

    channelName: { type: String, default: '' },
    channelDescription: { type: String, default: '' },
    channelKeywords: [{ type: String }],
    targetAudience: { type: String, default: '' },

    totalProjectsCreated: { type: Number, default: 0 },
    totalCreditsUsed: { type: Number, default: 0 },
    averageQualityScore: { type: Number, default: 0 },
    favoriteGenre: { type: String, default: '' },
    lastActiveAt: { type: Date, default: Date.now },

    styleEvolutions: [
      {
        field: { type: String, required: true },
        oldValue: { type: String },
        newValue: { type: String },
        reason: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

UserMemorySchema.index({ userId: 1 }, { unique: true });

export const UserMemory = mongoose.model<IUserMemory>('UserMemory', UserMemorySchema);
