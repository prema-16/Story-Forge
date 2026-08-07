import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  User,
  Project,
  CreateProjectData,
  PaginationMeta,
  WorkflowStep,
  WorkflowPlan,
  Script,
  Scene,
  Thumbnail,
  Voice,
  SEOData,
} from '@storyforge/shared';

export type {
  User,
  Project,
  CreateProjectData,
  PaginationMeta,
  WorkflowStep,
  WorkflowPlan,
  Script,
  Scene,
  Thumbnail,
  Voice,
  SEOData,
};

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  const formatUrl = (url: string) => {
    let clean = url.trim().replace(/\/$/, '');
    if (!clean.endsWith('/api')) {
      clean = `${clean}/api`;
    }
    return clean;
  };

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return formatUrl(envUrl);
      }
      return 'https://storyforge-backend-lxu1.onrender.com/api';
    }
  }

  return envUrl ? formatUrl(envUrl) : 'http://localhost:5000/api';
}

const BASE_URL = getApiBaseUrl();

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      timeout: 120000, // 2 min timeout for AI generation
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor — attach token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor — auto refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;
          try {
            const { data } = await this.client.post('/auth/refresh');
            this.setToken(data.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.client(originalRequest);
          } catch {
            this.clearToken();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.accessToken = token;
  }

  clearToken() {
    this.accessToken = null;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.get<{ data: T }>(url, config);
    return data.data as T;
  }

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<{ data: T; message?: string }> {
    const response = await this.client.post<{ data: T; message: string }>(url, body, config);
    return { data: response.data.data as T, message: response.data.message };
  }

  async put<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await this.client.put<{ data: T }>(url, body);
    return data.data as T;
  }

  async patch<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await this.client.patch<{ data: T }>(url, body);
    return data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const { data } = await this.client.delete<{ data: T }>(url);
    return data.data as T;
  }
}

export const api = new ApiClient();

// ========================
// Typed API methods
// ========================
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me'),
};

export const projectsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<{ projects: Project[]; meta: PaginationMeta }>(`/projects?${new URLSearchParams(params as any).toString()}`),
  get: (id: string) =>
    api.get<{ project: Project; script?: Script; scenes?: Scene[]; thumbnail?: Thumbnail; voice?: Voice; seo?: SEOData; exports?: Array<{ videoUrl?: string }> }>(`/projects/${id}`),
  getById: (id: string) =>
    api.get<{ project: Project; script?: Script; scenes?: Scene[]; thumbnail?: Thumbnail; voice?: Voice; seo?: SEOData; exports?: Array<{ videoUrl?: string }> }>(`/projects/${id}`),
  getOne: (id: string) =>
    api.get<{ project: Project; script?: Script; scenes?: Scene[]; thumbnail?: Thumbnail; voice?: Voice; seo?: SEOData; exports?: Array<{ videoUrl?: string }> }>(`/projects/${id}`),
  create: (data: CreateProjectData) =>
    api.post<{ project: Project; workflowPlan: WorkflowPlan }>('/projects', data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  duplicate: (id: string) => api.post<{ project: Project }>(`/projects/${id}/duplicate`),
  generateScript: (id: string) => api.post<{ script: Script; creditsUsed: number }>(`/projects/${id}/generate-script`),
  generateScenes: (id: string) => api.post<{ scenes: Scene[]; creditsUsed: number }>(`/projects/${id}/generate-scenes`),
  generatePrompts: (id: string) => api.post<{ prompts: unknown[]; creditsUsed: number }>(`/projects/${id}/generate-prompts`),
  generateVoice: (id: string, data?: { voiceId?: string; voiceName?: string; speed?: number; emotion?: string }) =>
    api.post<{ voice: Voice; creditsUsed: number }>(`/projects/${id}/generate-voice`, data),
  generateThumbnail: (id: string) => api.post<{ thumbnail: Thumbnail; creditsUsed: number }>(`/projects/${id}/generate-thumbnail`),
  generateSEO: (id: string) => api.post<{ seo: SEOData; creditsUsed: number }>(`/projects/${id}/generate-seo`),
  renderVideo: (id: string, data?: { resolution?: string; format?: string; includeSubtitles?: boolean }) =>
    api.post<{ jobId: string }>(`/projects/${id}/render`, data),
  saveScript: (id: string, data: { title?: string; introduction?: string; chapters?: Array<{ title?: string; content?: string }>; ending?: string; outro?: string; scriptText?: string }) =>
    api.post<{ script: Script; scenes: Scene[] }>(`/projects/${id}/script`, data),
};

// ========================
// TypeScript types
// Note: Domain models (User, Project, Script, Scene, etc.) are imported from @storyforge/shared.

