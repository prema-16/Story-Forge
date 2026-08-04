'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Key, Bell, Cpu, Monitor,
  LogOut, Trash2, Save, Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/app-layout';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface Session {
  tokenId: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastUsedAt: string;
}

const SETTING_TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security & Sessions', icon: Shield },
  { id: 'providers', label: 'AI Providers', icon: Cpu },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const { user, fetchMe } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    if (activeTab === 'security') loadSessions();
  }, [activeTab]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const result = await api.get<{ sessions: Session[] }>('/auth/sessions');
      setSessions((result as any).sessions || []);
    } catch { /* ignore */ } finally {
      setIsLoadingSessions(false);
    }
  };

  const revokeSession = async (tokenId: string) => {
    try {
      await api.delete(`/auth/sessions/${tokenId}`);
      setSessions(s => s.filter(s => s.tokenId !== tokenId));
      toast.success('Session revoked');
    } catch {
      toast.error('Failed to revoke session');
    }
  };

  const revokeAll = async () => {
    if (!confirm('Sign out of all devices?')) return;
    try {
      await api.post('/auth/logout-all', {});
      toast.success('All sessions revoked. Please log in again.');
      useAuthStore.getState().logout();
    } catch {
      toast.error('Failed to revoke all sessions');
    }
  };

  return (
    <AppLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="settings-layout">
        {/* Sidebar tabs */}
        <nav className="settings-nav">
          {SETTING_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="settings-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'profile' && <ProfileTab user={user} onSave={fetchMe} />}
              {activeTab === 'security' && (
                <SecurityTab
                  sessions={sessions}
                  isLoading={isLoadingSessions}
                  onRevoke={revokeSession}
                  onRevokeAll={revokeAll}
                  onRefresh={loadSessions}
                />
              )}
              {activeTab === 'providers' && <ProvidersTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .settings-layout { display: flex; gap: 24px; max-width: 1000px; }
        .settings-nav {
          display: flex; flex-direction: column; gap: 4px;
          width: 200px; flex-shrink: 0;
        }
        .settings-tab {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          background: transparent; border: none;
          color: rgba(255,255,255,0.45); cursor: pointer;
          transition: all 0.15s; text-align: left;
          font-family: 'Inter', sans-serif;
        }
        .settings-tab.active { background: rgba(124,58,237,0.15); color: #a78bfa; }
        .settings-tab:hover:not(.active) { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
        .settings-content { flex: 1; min-width: 0; }
      `}</style>
    </AppLayout>
  );
}

// ─── Profile Tab ─────────────────────────────────────────
function ProfileTab({ user, onSave }: { user: any; onSave: () => void }) {
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch('/users/profile', { name });
      await onSave();
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">Profile Information</h3>
      <div className="settings-card">
        <div className="field-group">
          <label className="field-label">Display Name</label>
          <input
            className="settings-input"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Email Address</label>
          <input className="settings-input" value={user?.email || ''} disabled />
          <p className="field-hint">Email changes require support contact.</p>
        </div>
        <div className="field-group">
          <label className="field-label">Plan</label>
          <div className="plan-badge-row">
            <span className="plan-badge">{user?.plan || 'free'}</span>
            <a href="/billing" className="upgrade-link">Upgrade →</a>
          </div>
        </div>
        <button className="save-btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────
function SecurityTab({ sessions, isLoading, onRevoke, onRevokeAll, onRefresh }: {
  sessions: Session[];
  isLoading: boolean;
  onRevoke: (id: string) => void;
  onRevokeAll: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="settings-section">
      <h3 className="section-title">Active Sessions</h3>
      <div className="settings-card">
        <div className="session-header">
          <p className="session-desc">These are all the devices currently logged into your account.</p>
          <div className="session-actions-row">
            <button className="icon-action-btn" onClick={onRefresh} title="Refresh">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="danger-btn" onClick={onRevokeAll}>
              <LogOut className="h-3.5 w-3.5" /> Revoke All Sessions
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-sessions">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            No active sessions found.
          </p>
        ) : (
          <div className="sessions-list">
            {sessions.map((session, i) => (
              <div key={session.tokenId} className={`session-row ${i === 0 ? 'current-session' : ''}`}>
                <div className="session-icon">
                  <Monitor className="h-4 w-4" />
                </div>
                <div className="session-info">
                  <p className="session-agent">{truncateUA(session.userAgent)}</p>
                  <p className="session-meta">{session.ip} · Last active {formatRelative(session.lastUsedAt)}</p>
                  {i === 0 && <span className="current-badge">Current Session</span>}
                </div>
                {i !== 0 && (
                  <button className="revoke-btn" onClick={() => onRevoke(session.tokenId)}>
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Providers Tab ─────────────────────────────────────────
function ProvidersTab() {
  const PROVIDERS = [
    { category: 'Text Generation', options: ['openai (GPT-4o)', 'anthropic (Claude)', 'gemini (Gemini 1.5 Pro)', 'mock (testing)'], env: 'DEFAULT_TEXT_PROVIDER' },
    { category: 'Image Generation', options: ['dalle (DALL-E 3)', 'stability (SDXL)', 'mock (testing)'], env: 'DEFAULT_IMAGE_PROVIDER' },
    { category: 'Voice Synthesis', options: ['elevenlabs (Multilingual v2)', 'openai-tts (TTS-1-HD)', 'mock (testing)'], env: 'DEFAULT_VOICE_PROVIDER' },
    { category: 'Video Generation', options: ['runway (Gen-3)', 'kling (Kling 2.0)', 'mock (testing)'], env: 'DEFAULT_VIDEO_PROVIDER' },
  ];

  return (
    <div className="settings-section">
      <h3 className="section-title">AI Provider Configuration</h3>
      <div className="settings-card">
        <div className="provider-note">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <p>Provider selection is managed via environment variables. Contact your system administrator or update <code>.env</code> to change providers.</p>
        </div>
        <div className="providers-list">
          {PROVIDERS.map(p => (
            <div key={p.category} className="provider-row">
              <div>
                <p className="provider-category">{p.category}</p>
                <p className="provider-env">{p.env}</p>
              </div>
              <div className="provider-options">
                {p.options.map(opt => (
                  <span key={opt} className="provider-option">{opt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    generationComplete: true,
    renderComplete: true,
    creditsLow: true,
    newFeatures: false,
    weeklyReport: false,
  });

  return (
    <div className="settings-section">
      <h3 className="section-title">Notification Preferences</h3>
      <div className="settings-card">
        {Object.entries({
          generationComplete: 'When AI generation completes',
          renderComplete: 'When video render finishes',
          creditsLow: 'When credits fall below 50',
          newFeatures: 'New features and announcements',
          weeklyReport: 'Weekly usage report',
        }).map(([key, label]) => (
          <div key={key} className="notif-row">
            <span className="notif-label">{label}</span>
            <button
              className={`toggle-switch ${prefs[key as keyof typeof prefs] ? 'on' : 'off'}`}
              onClick={() => setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof prefs] }))}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        ))}
        <button className="save-btn" style={{ marginTop: 8 }} onClick={() => toast.success('Preferences saved')}>
          <Save className="h-3.5 w-3.5" /> Save Preferences
        </button>
      </div>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────
const sharedStyle = `
  .settings-section { display: flex; flex-direction: column; gap: 16px; }
  .section-title { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.02em; font-family: 'Space Grotesk', sans-serif; }
  .settings-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); }
  .settings-input { padding: 9px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 13px; outline: none; font-family: 'Inter', sans-serif; transition: border-color 0.15s; }
  .settings-input:focus { border-color: rgba(124,58,237,0.5); }
  .settings-input:disabled { opacity: 0.4; cursor: not-allowed; }
  .field-hint { font-size: 11px; color: rgba(255,255,255,0.25); }
  .plan-badge-row { display: flex; align-items: center; gap: 10px; }
  .plan-badge { padding: 3px 10px; border-radius: 8px; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3); font-size: 11px; font-weight: 700; color: #a78bfa; text-transform: capitalize; }
  .upgrade-link { font-size: 12px; color: #a78bfa; text-decoration: none; font-weight: 600; }
  .save-btn { display: flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #6d28d9); border: none; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; align-self: flex-start; font-family: 'Inter', sans-serif; transition: all 0.15s; }
  .save-btn:hover:not(:disabled) { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Sessions */
  .session-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .session-desc { font-size: 13px; color: rgba(255,255,255,0.4); }
  .session-actions-row { display: flex; align-items: center; gap: 8px; }
  .icon-action-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .icon-action-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .danger-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 9px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s; }
  .danger-btn:hover { background: rgba(239,68,68,0.2); }
  .sessions-list { display: flex; flex-direction: column; gap: 8px; }
  .session-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }
  .session-row.current-session { border-color: rgba(124,58,237,0.2); background: rgba(124,58,237,0.04); }
  .session-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); flex-shrink: 0; }
  .session-info { flex: 1; }
  .session-agent { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }
  .session-meta { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }
  .current-badge { display: inline-block; margin-top: 4px; padding: 1px 6px; border-radius: 4px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25); font-size: 9px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.06em; }
  .revoke-btn { display: flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 7px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); color: #f87171; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s; }
  .revoke-btn:hover { background: rgba(239,68,68,0.15); }
  .loading-sessions { font-size: 13px; color: rgba(255,255,255,0.3); text-align: center; padding: 24px 0; }

  /* Providers */
  .provider-note { display: flex; align-items: flex-start; gap: 10px; padding: 12px; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15); border-radius: 10px; font-size: 12px; color: rgba(255,255,255,0.5); }
  .provider-note code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-family: monospace; color: rgba(255,255,255,0.7); }
  .providers-list { display: flex; flex-direction: column; gap: 16px; }
  .provider-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  .provider-category { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }
  .provider-env { font-size: 10px; color: rgba(255,255,255,0.25); font-family: monospace; margin-top: 2px; }
  .provider-options { display: flex; flex-wrap: wrap; gap: 4px; }
  .provider-option { padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); font-size: 11px; color: rgba(255,255,255,0.4); }

  /* Notifications */
  .notif-row { display: flex; align-items: center; justify-content: space-between; }
  .notif-label { font-size: 13px; color: rgba(255,255,255,0.65); }
  .toggle-switch { width: 40px; height: 22px; border-radius: 11px; border: none; cursor: pointer; position: relative; transition: background 0.2s; }
  .toggle-switch.on { background: #7c3aed; }
  .toggle-switch.off { background: rgba(255,255,255,0.1); }
  .toggle-thumb { position: absolute; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  .toggle-switch.on .toggle-thumb { left: 21px; }
  .toggle-switch.off .toggle-thumb { left: 3px; }
`;

// Inject shared styles
if (typeof window !== 'undefined') {
  const id = 'settings-shared-styles';
  if (!document.getElementById(id)) {
    const tag = document.createElement('style');
    tag.id = id;
    tag.textContent = sharedStyle;
    document.head.appendChild(tag);
  }
}

function truncateUA(ua: string) {
  if (ua.length < 60) return ua;
  const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
  return match ? `${match[0]} — ${ua.slice(0, 30)}...` : ua.slice(0, 60) + '...';
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
