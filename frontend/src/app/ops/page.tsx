'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const OPS_MODULES = [
  { href: '/ops/status', label: 'Global Status', icon: '🌐', desc: 'Service health across all 6 regions', color: 'from-green-500 to-emerald-600' },
  { href: '/ops/observability', label: 'Observability', icon: '📊', desc: 'Metrics, traces, logs & alerts', color: 'from-blue-500 to-indigo-600' },
  { href: '/ops/security', label: 'Security Center', icon: '🔒', desc: 'OWASP, SBOM, anomaly detection', color: 'from-red-500 to-rose-600' },
  { href: '/ops/compliance', label: 'Compliance', icon: '⚖️', desc: 'GDPR, SOC 2, ISO 27001 status', color: 'from-purple-500 to-violet-600' },
  { href: '/ops/ai-evaluation', label: 'AI Evaluation', icon: '🤖', desc: 'Prompt quality, regression suite', color: 'from-amber-500 to-orange-600' },
  { href: '/ops/infrastructure', label: 'Infrastructure', icon: '⚙️', desc: 'Kubernetes, autoscaling, DR', color: 'from-cyan-500 to-teal-600' },
  { href: '/ops/releases', label: 'Release Pipeline', icon: '🚀', desc: 'CI/CD pipeline & deployments', color: 'from-pink-500 to-fuchsia-600' },
  { href: '/ops/cost', label: 'Cost Optimizer', icon: '💰', desc: 'AI cost routing & forecasting', color: 'from-yellow-500 to-amber-600' },
  { href: '/ops/disaster-recovery', label: 'Disaster Recovery', icon: '🛡️', desc: 'Backup verification & RTO/RPO', color: 'from-slate-500 to-gray-600' },
  { href: '/ops/kpi', label: 'Executive KPIs', icon: '📈', desc: 'Platform-wide business metrics', color: 'from-lime-500 to-green-600' },
];

interface HealthScore {
  overallScore: number;
  grade: string;
  availabilityPct: number;
}

export default function OperationsCenterPage() {
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setHealthScore({ overallScore: 98, grade: 'A', availabilityPct: 99.97 });
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              ⚡ Operations Center
            </h1>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.95rem' }}>StoryForge AI V3 — Production Platform Dashboard</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{currentTime.toUTCString()}</div>
            {healthScore && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '0.3rem 0.9rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                  🟢 System Health: {healthScore.overallScore}/100 (Grade {healthScore.grade})
                </span>
                <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '0.3rem 0.9rem', color: '#a5b4fc', fontSize: '0.85rem' }}>
                  Uptime: {healthScore.availabilityPct}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KPI Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'API p95 Latency', value: '142ms', target: '< 200ms', ok: true },
            { label: 'Active Users', value: '84,219', target: '100K target', ok: true },
            { label: 'Render Jobs/hr', value: '987', target: '1,000 cap', ok: true },
            { label: 'AI Provider Health', value: '4/4', target: 'All providers', ok: true },
          ].map((kpi) => (
            <div key={kpi.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.ok ? '#10b981' : '#f43f5e', marginTop: '0.3rem' }}>{kpi.value}</div>
              <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.2rem' }}>{kpi.target}</div>
            </div>
          ))}
        </div>

        {/* Module Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {OPS_MODULES.map((mod) => (
            <Link key={mod.href} href={mod.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20,
                padding: '1.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${mod.color.replace('from-', '').replace(' to-', ',').replace(/-\d+/g, '')})` }} />
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{mod.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.4rem 0' }}>{mod.label}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>{mod.desc}</p>
                <div style={{ marginTop: '1rem', color: '#6366f1', fontSize: '0.82rem', fontWeight: 600 }}>Open → </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '3rem', textAlign: 'center', color: '#334155', fontSize: '0.8rem' }}>
          StoryForge AI V3 — Version 1.0.0 — Operations Center
        </div>
      </div>
    </div>
  );
}
