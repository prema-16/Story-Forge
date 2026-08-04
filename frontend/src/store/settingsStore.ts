import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  sidebarCollapsed: boolean;
  chatOpen: boolean;
  defaultGenre: string;
  defaultStyle: string;
  defaultAspectRatio: string;
  defaultLanguage: string;
  autoSave: boolean;
  notifications: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setChatOpen: (v: boolean) => void;
  toggleChat: () => void;
  setPreference: <K extends keyof Omit<SettingsStore, 'setSidebarCollapsed' | 'toggleSidebar' | 'setChatOpen' | 'toggleChat' | 'setPreference' | 'reset'>>(key: K, value: SettingsStore[K]) => void;
  reset: () => void;
}

const defaults = {
  sidebarCollapsed: false,
  chatOpen: false,
  defaultGenre: 'documentary',
  defaultStyle: 'cinematic',
  defaultAspectRatio: '16:9',
  defaultLanguage: 'en',
  autoSave: true,
  notifications: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaults,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setChatOpen: (v) => set({ chatOpen: v }),
      toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
      setPreference: (key, value) => set({ [key]: value } as any),
      reset: () => set(defaults),
    }),
    { name: 'storyforge-settings' }
  )
);
