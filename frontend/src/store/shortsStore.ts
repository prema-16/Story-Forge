import { create } from 'zustand';
import {
  ShortsProject, ShortInputType, ShortDuration, VisualStyle, VideoAIProvider,
  SubtitleStyle, HookVariation, ViralityScoreBreakdown, RetentionPrediction, BatchShortsJob
} from '@storyforge/shared';
import { api } from '../lib/api';

interface ShortsState {
  currentProject: ShortsProject | null;
  batchJob: BatchShortsJob | null;
  isGenerating: boolean;
  activeInputType: ShortInputType;
  targetDuration: ShortDuration;
  visualStyle: VisualStyle;
  videoProvider: VideoAIProvider;
  subtitleStyle: SubtitleStyle;
  hookVariations: HookVariation[];
  selectedHook: HookVariation | null;
  viralityScore: ViralityScoreBreakdown | null;
  retentionPrediction: RetentionPrediction | null;

  // Actions
  setActiveInputType: (type: ShortInputType) => void;
  setTargetDuration: (duration: ShortDuration) => void;
  setVisualStyle: (style: VisualStyle) => void;
  setVideoProvider: (provider: VideoAIProvider) => void;
  setSubtitleStyle: (style: SubtitleStyle) => void;
  setSelectedHook: (hook: HookVariation) => void;
  
  createShort: (params: {
    title: string;
    sourceContent: string;
  }) => Promise<ShortsProject>;

  generateHooks: (topic: string) => Promise<HookVariation[]>;
  triggerBatchGeneration: (count: number, topic: string) => Promise<BatchShortsJob>;
  publishShort: (platforms: string[]) => Promise<any>;
}

export const useShortsStore = create<ShortsState>((set, get) => ({
  currentProject: null,
  batchJob: null,
  isGenerating: false,
  activeInputType: 'prompt',
  targetDuration: 30,
  visualStyle: 'cyberpunk',
  videoProvider: 'auto',
  subtitleStyle: 'mrbeast',
  hookVariations: [],
  selectedHook: null,
  viralityScore: null,
  retentionPrediction: null,

  setActiveInputType: (type) => set({ activeInputType: type }),
  setTargetDuration: (duration) => set({ targetDuration: duration }),
  setVisualStyle: (style) => set({ visualStyle: style }),
  setVideoProvider: (provider) => set({ videoProvider: provider }),
  setSubtitleStyle: (style) => set({ subtitleStyle: style }),
  setSelectedHook: (hook) => set({ selectedHook: hook }),

  createShort: async (params) => {
    set({ isGenerating: true });
    try {
      const state = get();
      const res = await api.post<{ project: ShortsProject }>('/shorts/generate', {
        title: params.title,
        inputType: state.activeInputType,
        sourceContent: params.sourceContent,
        targetDurationSeconds: state.targetDuration,
        visualStyle: state.visualStyle,
        videoProvider: state.videoProvider,
        subtitleStyle: state.subtitleStyle,
      });

      const project = (res as any).project || (res as any).data?.project;
      set({
        currentProject: project,
        hookVariations: project.hookVariations,
        selectedHook: project.selectedHook,
        viralityScore: project.viralityScore,
        retentionPrediction: project.retentionPrediction,
        isGenerating: false,
      });
      return project;
    } catch {
      set({ isGenerating: false });
      throw new Error('Failed to generate short project');
    }
  },

  generateHooks: async (topic) => {
    try {
      const res = await api.post<{ hooks: HookVariation[] }>('/shorts/hooks', {
        topic,
        inputType: get().activeInputType,
      });
      const hooks = (res as any).hooks || (res as any).data?.hooks || [];
      set({ hookVariations: hooks });
      return hooks;
    } catch {
      return [];
    }
  },

  triggerBatchGeneration: async (count, topic) => {
    set({ isGenerating: true });
    try {
      const res = await api.post<{ batchJob: BatchShortsJob }>('/shorts/batch', { count, topic });
      const batchJob = (res as any).batchJob || (res as any).data?.batchJob;
      set({ batchJob, isGenerating: false });
      return batchJob;
    } catch {
      set({ isGenerating: false });
      throw new Error('Failed batch generation');
    }
  },

  publishShort: async (platforms) => {
    const proj = get().currentProject;
    if (!proj) return null;
    return await api.post('/shorts/publish', {
      shortProjectId: proj._id,
      platforms,
      title: proj.title,
      description: 'Generated with StoryForge AI Shorts Studio',
      hashtags: ['#Shorts', '#AI', '#ViralShorts'],
    });
  },
}));
