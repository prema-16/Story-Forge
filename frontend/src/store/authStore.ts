import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, authApi, User } from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  devMockLogin?: () => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
}

const MOCK_DEMO_USER: User = {
  _id: 'demo-user-123',
  name: 'Enterprise Creator (Dev)',
  email: 'demo@storyforge.ai',
  role: 'user',
  plan: 'enterprise',
  credits: 10000,
  creditsUsed: 0,
  creditsTotal: 10000,
  isActive: true,
  isEmailVerified: true,
  isTwoFactorEnabled: false,
  oauthAccounts: [],
  apiKeys: [],
  preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: { generationComplete: true, renderComplete: true, creditsLow: true, securityAlerts: true },
  },
  failedLoginAttempts: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const isDevEnterpriseMockAllowed = () => process.env.NEXT_PUBLIC_DEV_ENTERPRISE_MODE === 'true';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      // BUG 004 Fix: Always perform real backend authentication.
      // If backend auth fails or backend is offline, authentication fails and throws error. Never bypass or mock automatically.
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          api.setToken(data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
        } catch (err: any) {
          // Always clear token and fail on error — no silent fallback
          api.clearToken();
          set({ user: null, accessToken: null, isAuthenticated: false });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register({ name, email, password });
          api.setToken(data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
        } catch (err: any) {
          api.clearToken();
          set({ user: null, accessToken: null, isAuthenticated: false });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // Explicit dev-only mock login pathway (ONLY when DEV_ENTERPRISE_MODE=true)
      devMockLogin: () => {
        if (!isDevEnterpriseMockAllowed()) {
          throw new Error('Dev enterprise mode is disabled');
        }
        const mockToken = 'mock-demo-access-token';
        api.setToken(mockToken);
        set({
          user: MOCK_DEMO_USER,
          accessToken: mockToken,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        api.clearToken();
        set({ user: null, accessToken: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      fetchMe: async () => {
        const token = get().accessToken;
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        if (token === 'mock-demo-access-token' || token.startsWith('mock-')) {
          if (isDevEnterpriseMockAllowed()) {
            set({ isAuthenticated: true, user: get().user || MOCK_DEMO_USER });
            return;
          } else {
            api.clearToken();
            set({ user: null, isAuthenticated: false, accessToken: null });
            return;
          }
        }

        api.setToken(token);
        try {
          const result = await authApi.me();
          set({ user: result.user, isAuthenticated: true });
        } catch (err: any) {
          // If server returns explicit 401, clear session. Otherwise retain existing authenticated session if token exists.
          if (err?.response?.status === 401) {
            api.clearToken();
            set({ user: null, isAuthenticated: false, accessToken: null });
          } else if (get().user && get().accessToken) {
            set({ isAuthenticated: true });
          }
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'storyforge-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, accessToken: state.accessToken }),
    }
  )
);
