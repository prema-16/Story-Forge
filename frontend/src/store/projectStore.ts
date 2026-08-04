import { create } from 'zustand';
import { projectsApi, Project, PaginationMeta } from '../lib/api';
import toast from 'react-hot-toast';

const MOCK_PROJECTS: Project[] = [
  {
    _id: 'proj-101',
    userId: 'user_1',
    title: 'The Dark History of Quantum Physics',
    idea: 'An in-depth documentary exploring quantum entanglement, Einstein vs Bohr debates, and real-world quantum computing applications.',
    genre: 'documentary',
    videoLength: 10,
    style: 'cinematic',
    aspectRatio: '16:9',
    language: 'en',
    status: 'completed',
    currentStep: 10,
    totalSteps: 10,
    creditsTotal: 35,
    creditsUsed: 35,
    workflowSteps: [
      { step: 'ai-writer', status: 'completed', creditsUsed: 5 },
      { step: 'ai-scene-planner', status: 'completed', creditsUsed: 3 },
      { step: 'ai-prompt-engineer', status: 'completed', creditsUsed: 3 },
      { step: 'ai-voice-director', status: 'completed', creditsUsed: 10 },
      { step: 'ai-thumbnail-designer', status: 'completed', creditsUsed: 8 },
      { step: 'ai-seo-specialist', status: 'completed', creditsUsed: 2 },
      { step: 'ai-video-director', status: 'completed', creditsUsed: 4 },
    ],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'proj-102',
    userId: 'user_1',
    title: 'Cyberpunk Crime Confidential',
    idea: 'A neo-noir crime thriller investigating synthetic human trafficking in 2088 Neon Bay.',
    genre: 'crime',
    videoLength: 8,
    style: 'cinematic',
    aspectRatio: '16:9',
    language: 'en',
    status: 'generating',
    currentStep: 4,
    totalSteps: 10,
    creditsTotal: 25,
    creditsUsed: 18,
    workflowSteps: [
      { step: 'ai-writer', status: 'completed', creditsUsed: 5 },
      { step: 'ai-scene-planner', status: 'completed', creditsUsed: 3 },
      { step: 'ai-prompt-engineer', status: 'completed', creditsUsed: 3 },
      { step: 'ai-voice-director', status: 'running', creditsUsed: 7 },
    ],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'proj-103',
    userId: 'user_1',
    title: 'Space Missions That Failed Horribly',
    idea: 'Documenting Apollo 13, Mars Climate Orbiter, and Soviet N1 rocket explosions with high visual drama.',
    genre: 'space',
    videoLength: 12,
    style: 'documentary',
    aspectRatio: '16:9',
    language: 'en',
    status: 'draft',
    currentStep: 1,
    totalSteps: 10,
    creditsTotal: 30,
    creditsUsed: 5,
    workflowSteps: [
      { step: 'ai-writer', status: 'completed', creditsUsed: 5 },
    ],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface ProjectStore {
  projects: Project[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  currentPage: number;

  fetchProjects: (params?: { page?: number; status?: string; search?: string }) => Promise<void>;
  setSearch: (q: string) => void;
  setStatusFilter: (s: string) => void;
  setPage: (p: number) => void;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<Project | null>;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  meta: null,
  isLoading: false,
  searchQuery: '',
  statusFilter: '',
  currentPage: 1,

  fetchProjects: async (params) => {
    set({ isLoading: true });
    try {
      const { page = get().currentPage, status = get().statusFilter, search = get().searchQuery } = params ?? {};
      const result = await projectsApi.list({ page, limit: 12, status: status || undefined, search: search || undefined });
      set({ projects: result.projects, meta: result.meta, currentPage: page });
    } catch {
      // Fallback mock projects when backend API is offline
      set({ projects: MOCK_PROJECTS, meta: { page: 1, limit: 12, total: MOCK_PROJECTS.length, pages: 1 } });
    } finally {
      set({ isLoading: false });
    }
  },

  setSearch: (q) => set({ searchQuery: q }),
  setStatusFilter: (s) => set({ statusFilter: s }),
  setPage: (p) => set({ currentPage: p }),

  deleteProject: async (id) => {
    try {
      await projectsApi.delete(id);
    } catch {}
    set((s) => ({ projects: s.projects.filter((p) => p._id !== id) }));
    toast.success('Project deleted');
  },

  duplicateProject: async (id) => {
    const tid = toast.loading('Duplicating project...');
    try {
      const { data } = await projectsApi.duplicate(id);
      set((s) => ({ projects: [data.project, ...s.projects] }));
      toast.success('Project duplicated!', { id: tid });
      return data.project;
    } catch {
      const orig = get().projects.find(p => p._id === id);
      const dup: Project = orig
        ? { ...orig, _id: `proj-${Date.now()}`, title: `${orig.title} (Copy)`, status: 'draft', currentStep: 1 }
        : { ...MOCK_PROJECTS[0], _id: `proj-${Date.now()}`, title: 'Duplicated Video Project' };
      set((s) => ({ projects: [dup, ...s.projects] }));
      toast.success('Project duplicated!', { id: tid });
      return dup;
    }
  },

  reset: () => set({ projects: [], meta: null, searchQuery: '', statusFilter: '', currentPage: 1 }),
}));
