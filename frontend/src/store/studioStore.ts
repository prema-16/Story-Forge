import { create } from 'zustand';
import { Project, Script, Scene, Thumbnail, Voice, SEOData, projectsApi } from '../lib/api';
import toast from 'react-hot-toast';

export interface Keyframe {
  id: string;
  time: number;
  property: 'opacity' | 'scale' | 'volume' | 'positionX' | 'positionY';
  value: number;
}

export interface TimelineClip {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'subtitle' | 'effect';
  startTime: number;
  duration: number;
  mediaUrl: string;
  volume?: number;
  speed?: number;
  keyframes?: Keyframe[];
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'subtitle' | 'effect';
  isMuted: boolean;
  isLocked: boolean;
  isSolo: boolean;
  color: string;
  clips: TimelineClip[];
}

export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export interface AssetItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'subtitle' | 'brand';
  url: string;
  duration?: number;
  tags: string[];
  thumbnailUrl?: string;
  isFavorite: boolean;
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  timestamp: string;
  scenes: Scene[];
  tracks: TimelineTrack[];
}

interface GeneratingState {
  [key: string]: boolean;
}

interface SSEConnection {
  projectId: string;
  eventSource: EventSource | null;
  close: () => void;
}

interface StudioState {
  project: Project | null;
  script: Script | null;
  scenes: Scene[];
  thumbnail: Thumbnail | null;
  voice: Voice | null;
  seo: SEOData | null;
  prompts: unknown[];
  videoUrl: string | null;

  // NLE Timeline State
  tracks: TimelineTrack[];
  markers: TimelineMarker[];
  zoomScale: number; // 1 = 1s per 100px
  isSnapEnabled: boolean;
  isMagneticTimeline: boolean;

  // DAM Asset Library State
  assets: AssetItem[];
  selectedCategory: string;
  searchQuery: string;

  // Snapshots & Version Control
  snapshots: ProjectSnapshot[];

  // Generation state
  isGenerating: GeneratingState;
  errors: Record<string, string>;

  // Real-time state
  activeJobId: string | null;
  generationProgress: number;
  generationLogs: Array<{ type: string; message: string; timestamp: string; step?: string }>;
  sseConnection: SSEConnection | null;

  // Studio UI state
  activeTab: string;
  selectedSceneId: string | null;
  selectedClipId: string | null;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  totalDuration: number;
  isCommandPaletteOpen: boolean;
  undoStack: Array<{ action: string; snapshot: Partial<StudioState> }>;
  redoStack: Array<{ action: string; snapshot: Partial<StudioState> }>;

  // Actions
  setProject: (project: Project) => void;
  loadProject: (id: string) => Promise<void>;
  generateScript: (id: string) => Promise<void>;
  generateScenes: (id: string) => Promise<void>;
  generatePrompts: (id: string) => Promise<void>;
  generateVoice: (id: string, options?: { voiceId?: string; voiceName?: string; provider?: string; speed?: number; emotion?: string }) => Promise<void>;
  generateThumbnail: (id: string) => Promise<void>;
  generateSEO: (id: string) => Promise<void>;
  generateVideo: (id: string) => Promise<void>;
  saveScript: (id: string, data: { title?: string; introduction?: string; chapters?: Array<{ title?: string; content?: string }>; ending?: string; outro?: string; scriptText?: string }) => Promise<void>;

  // SSE
  connectSSE: (projectId: string) => void;
  disconnectSSE: () => void;
  addLog: (log: { type: string; message: string; timestamp: string; step?: string }) => void;

  // NLE Timeline Actions
  addTrack: (type: TimelineTrack['type'], name: string) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;
  addClipToTrack: (trackId: string, clip: TimelineClip) => void;
  updateClipPosition: (trackId: string, clipId: string, newStartTime: number, newDuration?: number) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  deleteClip: (clipId: string) => void;
  addMarker: (time: number, label: string) => void;
  setZoomScale: (scale: number) => void;
  toggleSnap: () => void;
  toggleMagnetic: () => void;

  // DAM Actions
  addAsset: (asset: AssetItem) => void;
  toggleFavoriteAsset: (assetId: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;

  // Version Control Actions
  createSnapshot: (name: string) => void;
  restoreSnapshot: (snapshotId: string) => void;

  // UI & Playback Actions
  setActiveTab: (tab: string) => void;
  setSelectedScene: (id: string | null) => void;
  setSelectedClip: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  pushToHistory: (action: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

// ─── Default Mock Data ──────────────────────────────────────────────────────

const DEFAULT_FALLBACK_PROJECT: Project = {
  _id: 'demo-proj-1',
  userId: 'user_1',
  title: 'Quantum Physics: Secrets of the Universe',
  idea: 'An immersive documentary exploring quantum entanglement and physics.',
  genre: 'documentary',
  videoLength: 10,
  style: 'cinematic',
  aspectRatio: '16:9',
  language: 'en',
  status: 'draft',
  currentStep: 1,
  totalSteps: 10,
  creditsTotal: 35,
  creditsUsed: 5,
  workflowSteps: [
    { step: 'ai-writer', status: 'completed', creditsUsed: 5 },
    { step: 'ai-scene-planner', status: 'pending', creditsUsed: 0 },
  ],
  isFavorite: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_FALLBACK_SCRIPT: Script = {
  _id: 'script-101',
  projectId: 'demo-proj-1',
  content: 'For centuries, humanity believed the universe followed strict Newtonian deterministic laws...',
  chapters: [
    { title: 'The Double Slit Experiment', content: 'Light acts as both a wave and a particle. Observing a quantum state forces it to collapse into reality.', durationSeconds: 120 },
    { title: 'Spooky Action at a Distance', content: 'Einstein called it spooky action at a distance. Entangled particles communicate instantaneously across galaxies.', durationSeconds: 180 },
  ],
  wordCount: 630,
  estimatedDurationSeconds: 300,
  language: 'en',
  provider: 'openai',
  model: 'gpt-4o',
  tokensUsed: 450,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_INITIAL_TRACKS: TimelineTrack[] = [
  {
    id: 't-video-1',
    name: 'Video Track 1',
    type: 'video',
    isMuted: false,
    isLocked: false,
    isSolo: false,
    color: '#8b5cf6',
    clips: [
      { id: 'c-v1', name: 'Quantum Intro SDXL', type: 'video', startTime: 0, duration: 8, mediaUrl: 'https://picsum.photos/seed/quantum1/1280/720' },
      { id: 'c-v2', name: 'Double Slit Experiment', type: 'video', startTime: 8, duration: 12, mediaUrl: 'https://picsum.photos/seed/quantum2/1280/720' },
    ],
  },
  {
    id: 't-audio-1',
    name: 'Voiceover (ElevenLabs)',
    type: 'audio',
    isMuted: false,
    isLocked: false,
    isSolo: false,
    color: '#10b981',
    clips: [
      { id: 'c-a1', name: 'Narration Chapter 1', type: 'audio', startTime: 0, duration: 20, mediaUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg', volume: 1.0 },
    ],
  },
  {
    id: 't-subtitle-1',
    name: 'Subtitles (Whisper)',
    type: 'subtitle',
    isMuted: false,
    isLocked: false,
    isSolo: false,
    color: '#f59e0b',
    clips: [
      { id: 'c-s1', name: 'For centuries, humanity believed...', type: 'subtitle', startTime: 0, duration: 5, mediaUrl: '' },
      { id: 'c-s2', name: 'But at the atomic scale, reality vanishes...', type: 'subtitle', startTime: 5, duration: 7, mediaUrl: '' },
    ],
  },
];

const DEFAULT_INITIAL_ASSETS: AssetItem[] = [
  { id: 'ast-1', name: 'Quantum Laboratory Visual', type: 'image', url: 'https://picsum.photos/seed/quantumlab/1280/720', tags: ['quantum', 'lab', 'cinematic'], isFavorite: true },
  { id: 'ast-2', name: 'Subatomic Particle Stream', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 15, tags: ['particles', 'video'], isFavorite: false },
  { id: 'ast-3', name: 'Deep Space Ambience BGM', type: 'audio', url: 'https://actions.google.com/sounds/v1/science_fiction/space_ambience.ogg', duration: 180, tags: ['bgm', 'space'], isFavorite: true },
];

export const useStudioStore = create<StudioState>((set, get) => ({
  project: null,
  script: null,
  scenes: [],
  thumbnail: null,
  voice: null,
  seo: null,
  prompts: [],
  videoUrl: null,

  tracks: DEFAULT_INITIAL_TRACKS,
  markers: [{ id: 'm1', time: 8, label: 'Chapter 2 Start', color: '#ec4899' }],
  zoomScale: 1,
  isSnapEnabled: true,
  isMagneticTimeline: true,

  assets: DEFAULT_INITIAL_ASSETS,
  selectedCategory: 'all',
  searchQuery: '',

  snapshots: [{ id: 'snap-v1.0', name: 'Initial AI Generation v1.0', timestamp: new Date().toISOString(), scenes: [], tracks: DEFAULT_INITIAL_TRACKS }],

  isGenerating: {},
  errors: {},
  activeJobId: null,
  generationProgress: 0,
  generationLogs: [],
  sseConnection: null,

  activeTab: 'script',
  selectedSceneId: null,
  selectedClipId: null,
  isPlaying: false,
  currentTime: 0,
  playbackSpeed: 1.0,
  totalDuration: 300,
  isCommandPaletteOpen: false,
  undoStack: [],
  redoStack: [],

  setProject: (project) => set({ project }),

  loadProject: async (id: string) => {
    // Clear previous project & script state to prevent displaying stale data
    set({
      project: null,
      script: null,
      scenes: [],
      thumbnail: null,
      voice: null,
      seo: null,
      videoUrl: null,
    });

    try {
      const data = await projectsApi.getById(id);
      if (data?.project) {
        set({
          project: data.project,
          script: data.script ?? null,
          scenes: data.scenes || [],
          thumbnail: data.thumbnail ?? null,
          voice: data.voice ?? null,
          seo: data.seo ?? null,
          prompts: [],
          videoUrl: data.exports?.[0]?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        });
        return;
      }
    } catch {
      // Check session storage draft if backend API is offline
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(`project_draft_${id}`);
        if (cached) {
          try {
            const draftProject = JSON.parse(cached);
            set({
              project: draftProject,
              script: null,
              scenes: [],
              thumbnail: null,
              voice: null,
              seo: null,
            });
            return;
          } catch {}
        }
      }

      // If no cached draft, create a dynamic placeholder matching this project ID
      set({
        project: {
          _id: id,
          userId: 'user_1',
          title: `Project #${id.slice(-6)}`,
          idea: 'AI generated video project',
          genre: 'documentary',
          videoLength: 10,
          style: 'cinematic',
          aspectRatio: '16:9',
          language: 'en',
          status: 'draft',
          currentStep: 1,
          totalSteps: 10,
          creditsTotal: 35,
          creditsUsed: 5,
          workflowSteps: [
            { step: 'ai-writer', status: 'pending', creditsUsed: 0 },
            { step: 'ai-scene-planner', status: 'pending', creditsUsed: 0 },
          ],
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        script: null,
        scenes: [],
      });
    }
  },

  generateScript: async (id: string) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, script: true } }));
    try {
      await projectsApi.generateScript(id);
      await get().loadProject(id);
      toast.success('AI Script queued & generated!');
    } catch (err: any) {
      toast.error(err.message || 'Script generation failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, script: false } }));
    }
  },

  generateScenes: async (id: string) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, scenes: true } }));
    try {
      await projectsApi.generateScenes(id);
      await get().loadProject(id);
      toast.success('AI Scene director breakdown complete!');
    } catch (err: any) {
      toast.error(err.message || 'Scene generation failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, scenes: false } }));
    }
  },

  generatePrompts: async (id: string) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, prompts: true } }));
    try {
      await projectsApi.generatePrompts(id);
      await get().loadProject(id);
      toast.success('AI Prompts generated!');
    } catch (err: any) {
      toast.error(err.message || 'Prompt generation failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, prompts: false } }));
    }
  },

  generateVoice: async (id: string, options) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, voice: true } }));
    try {
      await projectsApi.generateVoice(id, options);
      await get().loadProject(id);
      toast.success('AI Voiceover generated!');
    } catch (err: any) {
      toast.error(err.message || 'Voice generation failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, voice: false } }));
    }
  },

  generateThumbnail: async (id: string) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, thumbnail: true } }));
    try {
      await projectsApi.generateThumbnail(id);
      await get().loadProject(id);
      toast.success('AI Thumbnail generated!');
    } catch (err: any) {
      toast.error(err.message || 'Thumbnail generation failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, thumbnail: false } }));
    }
  },

  generateSEO: async (id: string) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, seo: true } }));
    try {
      await projectsApi.generateSEO(id);
      await get().loadProject(id);
      toast.success('AI SEO Metadata package complete!');
    } catch (err: any) {
      toast.error(err.message || 'SEO generation failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, seo: false } }));
    }
  },

  generateVideo: async (id: string) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, video: true } }));
    try {
      const res = await projectsApi.renderVideo(id);
      if (res?.data?.jobId) set({ activeJobId: res.data.jobId });
      await get().loadProject(id);
      toast.success('Video render queued! Processing video pipeline...');
    } catch (err: any) {
      toast.error(err.message || 'Video render failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, video: false } }));
    }
  },

  saveScript: async (id: string, data) => {
    set((state) => ({ isGenerating: { ...state.isGenerating, script: true } }));
    try {
      const res = await projectsApi.saveScript(id, data);
      if (res?.data?.script) set({ script: res.data.script });
      if (res?.data?.scenes) set({ scenes: res.data.scenes });
      await get().loadProject(id);
      toast.success('Custom script saved & scenes updated!');
    } catch (err: any) {
      toast.error(err.message || 'Saving custom script failed');
    } finally {
      set((state) => ({ isGenerating: { ...state.isGenerating, script: false } }));
    }
  },

  connectSSE: (projectId: string) => {
    const existing = get().sseConnection;
    if (existing) existing.close();

    try {
      const { getApiBaseUrl } = require('../lib/api');
      const baseUrl = getApiBaseUrl();
      const eventSource = new EventSource(`${baseUrl}/sse/projects/${projectId}/status`);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'step_progress') {
            set({ generationProgress: data.progress || 0 });
          }
          if (data.type === 'step_completed') {
            get().addLog({
              type: 'success',
              message: data.message || `${data.step || 'Step'} completed`,
              timestamp: new Date().toLocaleTimeString(),
              step: data.step,
            });
            get().loadProject(projectId);
          }
          if (data.type === 'step_failed') {
            get().addLog({
              type: 'error',
              message: data.error || `${data.step || 'Step'} failed`,
              timestamp: new Date().toLocaleTimeString(),
              step: data.step,
            });
            get().loadProject(projectId);
          }
        } catch (err) {
          console.error('[SSE] Parse error:', err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };

      set({
        sseConnection: {
          projectId,
          eventSource,
          close: () => eventSource.close(),
        },
      });
    } catch (err) {
      console.warn('[SSE] Connection error:', err);
    }
  },

  disconnectSSE: () => {
    const existing = get().sseConnection;
    if (existing) {
      existing.close();
      set({ sseConnection: null });
    }
  },

  addLog: (log) => set((state) => ({ generationLogs: [log, ...state.generationLogs] })),

  // NLE Timeline Actions
  addTrack: (type, name) => {
    get().pushToHistory('Add Track');
    const newTrack: TimelineTrack = {
      id: `t-${Date.now()}`,
      name,
      type,
      isMuted: false,
      isLocked: false,
      isSolo: false,
      color: type === 'video' ? '#8b5cf6' : type === 'audio' ? '#10b981' : '#f59e0b',
      clips: [],
    };
    set((state) => ({ tracks: [...state.tracks, newTrack] }));
    toast.success(`Track '${name}' added`);
  },

  toggleTrackLock: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isLocked: !t.isLocked } : t)),
    }));
  },

  toggleTrackMute: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t)),
    }));
  },

  addClipToTrack: (trackId, clip) => {
    get().pushToHistory('Add Clip');
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t)),
    }));
  },

  updateClipPosition: (trackId, clipId, newStartTime, newDuration) => {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === clipId ? { ...c, startTime: Math.max(0, newStartTime), ...(newDuration && { duration: newDuration }) } : c
              ),
            }
          : t
      ),
    }));
  },

  splitClip: (clipId, splitTime) => {
    get().pushToHistory('Split Clip');
    let found = false;
    const newTracks = get().tracks.map((track) => {
      const clipIndex = track.clips.findIndex((c) => c.id === clipId);
      if (clipIndex === -1) return track;

      const clip = track.clips[clipIndex];
      if (splitTime <= clip.startTime || splitTime >= clip.startTime + clip.duration) return track;

      found = true;
      const duration1 = splitTime - clip.startTime;
      const duration2 = clip.duration - duration1;

      const clip1: TimelineClip = { ...clip, duration: duration1 };
      const clip2: TimelineClip = { ...clip, id: `clip_${Date.now()}`, name: `${clip.name} (Part 2)`, startTime: splitTime, duration: duration2 };

      const updatedClips = [...track.clips];
      updatedClips.splice(clipIndex, 1, clip1, clip2);

      return { ...track, clips: updatedClips };
    });

    if (found) {
      set({ tracks: newTracks });
      toast.success('Clip split successfully');
    }
  },

  deleteClip: (clipId) => {
    get().pushToHistory('Delete Clip');
    set((state) => ({
      tracks: state.tracks.map((t) => ({ ...t, clips: t.clips.filter((c) => c.id !== clipId) })),
    }));
    toast.success('Clip removed');
  },

  addMarker: (time, label) => {
    set((state) => ({
      markers: [...state.markers, { id: `m_${Date.now()}`, time, label, color: '#ec4899' }],
    }));
    toast.success(`Marker added at ${time.toFixed(1)}s`);
  },

  setZoomScale: (scale) => set({ zoomScale: Math.min(5, Math.max(0.2, scale)) }),
  toggleSnap: () => set((state) => ({ isSnapEnabled: !state.isSnapEnabled })),
  toggleMagnetic: () => set((state) => ({ isMagneticTimeline: !state.isMagneticTimeline })),

  // DAM Actions
  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  toggleFavoriteAsset: (assetId) => set((state) => ({
    assets: state.assets.map((a) => (a.id === assetId ? { ...a, isFavorite: !a.isFavorite } : a)),
  })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Version Control Actions
  createSnapshot: (name) => {
    const snap: ProjectSnapshot = {
      id: `snap_${Date.now()}`,
      name,
      timestamp: new Date().toISOString(),
      scenes: get().scenes,
      tracks: get().tracks,
    };
    set((state) => ({ snapshots: [snap, ...state.snapshots] }));
    toast.success(`Snapshot '${name}' created`);
  },

  restoreSnapshot: (snapshotId) => {
    const snap = get().snapshots.find((s) => s.id === snapshotId);
    if (snap) {
      get().pushToHistory('Restore Snapshot');
      set({ scenes: snap.scenes, tracks: snap.tracks });
      toast.success(`Restored to snapshot '${snap.name}'`);
    }
  },

  // UI Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedScene: (id) => set({ selectedSceneId: id }),
  setSelectedClip: (id) => set({ selectedClipId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  pushToHistory: (action) => {
    const state = get();
    const snapshot = {
      tracks: state.tracks,
      scenes: state.scenes,
    };

    set({
      undoStack: [{ action, snapshot }, ...state.undoStack.slice(0, 49)], // 50-level history
      redoStack: [],
    });
  },

  undo: () => {
    const { undoStack, redoStack, tracks, scenes } = get();
    if (undoStack.length === 0) return;

    const [current, ...restUndo] = undoStack;
    set({
      tracks: current.snapshot.tracks || tracks,
      scenes: current.snapshot.scenes || scenes,
      undoStack: restUndo,
      redoStack: [{ action: current.action, snapshot: { tracks, scenes } }, ...redoStack],
    });
    toast('Undo: ' + current.action, { icon: '↩️' });
  },

  redo: () => {
    const { undoStack, redoStack, tracks, scenes } = get();
    if (redoStack.length === 0) return;

    const [current, ...restRedo] = redoStack;
    set({
      tracks: current.snapshot.tracks || tracks,
      scenes: current.snapshot.scenes || scenes,
      redoStack: restRedo,
      undoStack: [{ action: current.action, snapshot: { tracks, scenes } }, ...undoStack],
    });
    toast('Redo: ' + current.action, { icon: '↪️' });
  },

  reset: () => set({ project: null, script: null, scenes: [], isGenerating: {}, errors: {} }),
}));
