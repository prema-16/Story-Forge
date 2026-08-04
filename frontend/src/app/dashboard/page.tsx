'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap, TrendingUp, Video, Clock, Plus, ArrowRight,
  Sparkles, Activity, BarChart3, Cpu, Globe,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/app-layout';
import { useAuthStore } from '../../store/authStore';
import { projectsApi, api } from '../../lib/api';

interface DashboardStats {
  totalProjects: number;
  completedProjects: number;
  creditsUsed: number;
  creditsTotal: number;
  totalScenes: number;
  totalDurationMinutes: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  projectTitle?: string;
}

const GRADIENT_CARDS = [
  { gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', glow: 'rgba(124,58,237,0.4)' },
  { gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', glow: 'rgba(236,72,153,0.4)' },
  { gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', glow: 'rgba(6,182,212,0.4)' },
  { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', glow: 'rgba(16,185,129,0.4)' },
];

const QUICK_ACTIONS = [
  { label: 'New Project', icon: Plus, href: '/projects/new', gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)' },
  { label: 'Browse Templates', icon: Sparkles, href: '/templates', gradient: 'linear-gradient(135deg, #06b6d4, #7c3aed)' },
  { label: 'View Analytics', icon: BarChart3, href: '/analytics', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { label: 'AI Assistant', icon: Cpu, href: '/ai-chat', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes] = await Promise.all([
          projectsApi.list({ limit: 6 }),
        ]);

        const projects = projectsRes.projects || [];
        setRecentProjects(projects.slice(0, 6));

        const completed = projects.filter((p: any) => p.status === 'completed').length;
        const totalCreditsUsed = projects.reduce((s: number, p: any) => s + (p.creditsUsed || 0), 0);

        setStats({
          totalProjects: projectsRes.meta?.total ?? projects.length,
          completedProjects: completed,
          creditsUsed: user?.creditsUsed || totalCreditsUsed,
          creditsTotal: user?.creditsTotal || 1000,
          totalScenes: projects.reduce((s: number, p: any) => s + (p.scenesCount || 0), 0),
          totalDurationMinutes: Math.round(projects.reduce((s: number, p: any) => s + (p.videoLength || 0), 0)),
        });

        // Fake recent activity from real projects
        setActivity(projects.slice(0, 5).map((p: any) => ({
          id: p._id,
          type: p.status,
          message: `${p.status === 'completed' ? 'Completed' : p.status === 'generating' ? 'Generating' : 'Created'} "${p.title}"`,
          createdAt: p.updatedAt,
          projectTitle: p.title,
        })));
      } catch {
        // Silently fail — user sees empty state
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const creditsPercent = stats
    ? Math.round((stats.creditsUsed / Math.max(stats.creditsTotal, 1)) * 100)
    : 0;

  const STAT_CARDS = stats
    ? [
        { label: 'Total Projects', value: stats.totalProjects, sub: `${stats.completedProjects} completed`, icon: Video, ...GRADIENT_CARDS[0] },
        { label: 'Credits Used', value: stats.creditsUsed, sub: `${creditsPercent}% of ${stats.creditsTotal}`, icon: Zap, ...GRADIENT_CARDS[1] },
        { label: 'Videos Created', value: stats.completedProjects, sub: 'Ready for upload', icon: TrendingUp, ...GRADIENT_CARDS[2] },
        { label: 'Total Duration', value: `${stats.totalDurationMinutes}m`, sub: 'Across all videos', icon: Clock, ...GRADIENT_CARDS[3] },
      ]
    : [];

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0] ?? 'Creator'} 👋`}>
      <div className="dashboard">
        {/* ── Hero greeting ── */}
        <div className="dashboard-hero">
          <div className="hero-text">
            <h1>
              Good {getGreeting()},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'Creator'}</span>
            </h1>
            <p>Ready to create your next viral video? Let's build something incredible.</p>
          </div>
          <Link href="/projects/new" className="hero-cta">
            <Plus className="h-4 w-4" />
            New Project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stat-grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : STAT_CARDS.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="stat-card"
                  style={{ '--glow': card.glow } as React.CSSProperties}
                >
                  <div className="stat-card-inner">
                    <div className="stat-icon" style={{ background: card.gradient }}>
                      <card.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="stat-info">
                      <p className="stat-label">{card.label}</p>
                      <p className="stat-value">{card.value}</p>
                      <p className="stat-sub">{card.sub}</p>
                    </div>
                  </div>
                  {/* Credit usage bar */}
                  {card.label === 'Credits Used' && (
                    <div className="credit-bar-track">
                      <div className="credit-bar-fill" style={{ width: `${creditsPercent}%`, background: card.gradient }} />
                    </div>
                  )}
                </motion.div>
              ))}
        </div>

        {/* ── Quick Actions ── */}
        <section>
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <Link href={action.href} className="quick-action-card">
                  <div className="qa-icon" style={{ background: action.gradient }}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="qa-label">{action.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 qa-arrow" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Recent Projects + Activity ── */}
        <div className="bottom-grid">
          {/* Recent Projects */}
          <section className="recent-projects-section">
            <div className="section-header">
              <h2 className="section-title">Recent Projects</h2>
              <Link href="/projects" className="view-all">View All <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="projects-list">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProjectRowSkeleton key={i} />)
                : recentProjects.length === 0
                  ? <EmptyState />
                  : recentProjects.slice(0, 5).map((p, i) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.06 }}
                        className="project-row"
                        onClick={() => router.push(`/projects/${p._id}`)}
                      >
                        <div className="project-row-color" style={{ background: GRADIENT_CARDS[i % 4].gradient }} />
                        <div className="project-row-info">
                          <p className="project-row-title">{p.title}</p>
                          <p className="project-row-meta">{p.genre} · {p.videoLength}min · {new Date(p.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <StatusPill status={p.status} />
                        <ArrowRight className="h-3.5 w-3.5 text-white/20" />
                      </motion.div>
                    ))}
            </div>
          </section>

          {/* Activity Feed */}
          <section className="activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              {activity.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>No activity yet. Create your first project!</p>
                : activity.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="activity-item"
                    >
                      <div className={`activity-dot ${item.type}`} />
                      <div className="activity-content">
                        <p className="activity-message">{item.message}</p>
                        <p className="activity-time">{formatRelative(item.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .dashboard { display: flex; flex-direction: column; gap: 28px; max-width: 1400px; }

        /* Hero */
        .dashboard-hero {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(236,72,153,0.05) 100%);
          border: 1px solid rgba(124,58,237,0.15);
          border-radius: 20px;
          backdrop-filter: blur(20px);
        }
        .hero-text h1 { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.03em; font-family: 'Space Grotesk', sans-serif; }
        .hero-text p { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-cta {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.2s ease;
          box-shadow: 0 0 24px rgba(124,58,237,0.3);
        }
        .hero-cta:hover { transform: translateY(-1px); box-shadow: 0 0 32px rgba(124,58,237,0.5); }

        /* Stat grid */
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .stat-card {
          padding: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          transition: all 0.2s ease;
          cursor: default;
        }
        .stat-card:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); box-shadow: 0 0 30px var(--glow, rgba(124,58,237,0.2)); }
        .stat-card-inner { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-info { flex: 1; }
        .stat-label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .stat-value { font-size: 24px; font-weight: 800; color: #fff; line-height: 1; font-family: 'Space Grotesk', sans-serif; }
        .stat-sub { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .credit-bar-track { height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .credit-bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }

        /* Quick actions */
        .quick-actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .quick-action-card {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          text-decoration: none;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .quick-action-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); transform: translateY(-1px); }
        .qa-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .qa-label { flex: 1; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .qa-arrow { color: rgba(255,255,255,0.2); flex-shrink: 0; }
        .quick-action-card:hover .qa-arrow { color: rgba(255,255,255,0.6); }

        /* Bottom grid */
        .bottom-grid { display: grid; grid-template-columns: 1fr 380px; gap: 20px; }
        @media (max-width: 900px) { .bottom-grid { grid-template-columns: 1fr; } }
        .section-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); margin-bottom: 12px; letter-spacing: -0.01em; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .view-all { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #a78bfa; text-decoration: none; font-weight: 600; }
        .view-all:hover { color: #fff; }

        /* Project rows */
        .projects-list { display: flex; flex-direction: column; gap: 6px; }
        .project-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer; transition: all 0.15s;
        }
        .project-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .project-row-color { width: 3px; height: 36px; border-radius: 2px; flex-shrink: 0; }
        .project-row-info { flex: 1; min-width: 0; }
        .project-row-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .project-row-meta { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 1px; text-transform: capitalize; }

        /* Activity */
        .activity-list { display: flex; flex-direction: column; gap: 8px; }
        .activity-item { display: flex; align-items: flex-start; gap: 10px; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .activity-dot.completed { background: #34d399; }
        .activity-dot.generating { background: #fbbf24; animation: pulse 1.5s infinite; }
        .activity-dot.draft { background: rgba(255,255,255,0.2); }
        .activity-dot.failed { background: #f87171; }
        .activity-content { flex: 1; }
        .activity-message { font-size: 12px; color: rgba(255,255,255,0.65); }
        .activity-time { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 2px; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
      `}</style>
    </AppLayout>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', label: 'Draft' },
    generating: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Generating' },
    completed: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Completed' },
    failed: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Failed' },
    review: { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee', label: 'Review' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

function StatCardSkeleton() {
  return <div style={{ height: 100, borderRadius: 16, background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.8s infinite' }} className="shimmer-loading" />;
}
function ProjectRowSkeleton() {
  return <div style={{ height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }} className="shimmer-loading" />;
}
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
      No projects yet.{' '}
      <Link href="/projects/new" style={{ color: '#a78bfa', textDecoration: 'none' }}>
        Create your first one →
      </Link>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
