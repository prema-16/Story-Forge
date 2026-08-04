import mongoose, { Document, Schema } from 'mongoose';

export type VoiceStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type SubtitleFormat = 'srt' | 'vtt' | 'txt';

export interface IVoice extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  sceneId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Voice config
  voiceId: string; // provider's voice ID
  voiceName: string;
  provider: string; // elevenlabs | openai-tts | google-tts
  emotion: string;
  speed: number;
  pitch: number;
  language: string;

  // Content
  text: string;
  wordCount: number;
  durationSeconds: number;

  // Status
  status: VoiceStatus;
  errorMessage?: string;

  // Assets
  audioUrl?: string; // Cloudinary URL
  cloudinaryPublicId?: string;
  waveformData?: number[]; // amplitude data for waveform viz

  // Subtitles
  subtitles: {
    srt?: string;
    vtt?: string;
    txt?: string;
    cloudinaryUrls: Record<SubtitleFormat, string | undefined>;
  };

  // Metadata
  isNarration: boolean; // project-level vs scene-level
  creditsUsed: number;

  createdAt: Date;
  updatedAt: Date;
}

const VoiceSchema = new Schema<IVoice>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sceneId: { type: Schema.Types.ObjectId, ref: 'Scene' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    voiceId: { type: String, required: true },
    voiceName: { type: String, required: true },
    provider: { type: String, required: true },
    emotion: { type: String, default: 'neutral' },
    speed: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
    pitch: { type: Number, default: 0 },
    language: { type: String, default: 'en' },
    text: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: { type: String },
    audioUrl: { type: String },
    cloudinaryPublicId: { type: String },
    waveformData: [{ type: Number }],
    subtitles: {
      srt: { type: String },
      vtt: { type: String },
      txt: { type: String },
      cloudinaryUrls: {
        srt: { type: String },
        vtt: { type: String },
        txt: { type: String },
      },
    },
    isNarration: { type: Boolean, default: true },
    creditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

VoiceSchema.index({ projectId: 1 });
VoiceSchema.index({ status: 1 });

export const Voice = mongoose.model<IVoice>('Voice', VoiceSchema);
