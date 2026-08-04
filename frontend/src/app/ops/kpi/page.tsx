'use client';

export default function KPIDashboardPage() {
  const KPIS = [
    { label: 'Monthly Active Users', value: '84,219', target: '100,000', pct: 84, color: '#6366f1' },
    { label: 'Concurrent Renders/hr', value: '987', target: '1,000', pct: 99, color: '#10b981' },
    { label: 'API p95 Latency', value: '142ms', target: '< 200ms', pct: 71, color: '#10b981', invert: true },
    { label: 'Platform Availability', value: '99.97%', target: '99.95% SLA', pct: 100, color: '#10b981' },
    { label: 'AI Provider Uptime', value: '100%', target: '100%', pct: 100, color: '#10b981' },
    { label: 'Monthly Revenue', value: '$248,400', target: '$300K', pct: 83, color: '#f59e0b' },
    { label: 'Projects Generated', value: '127,841', target: '150K/mo', pct: 85, color: '#06b6d4' },
    { label: 'Enterprise Clients', value: '34', target: '50', pct: 68, color: '#a855f7' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📈 Executive KPI Dashboard</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>StoryForge AI V3 — Version 1.0.0 · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        {/* Top Banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-around' }}>
          {[
            { label: 'Health Score', value: '98/100', badge: 'Grade A' },
            { label: 'System Uptime', value: '99.97%', badge: '> 99.95% SLA ✅' },
            { label: 'Active Incidents', value: '0', badge: 'All Clear 🟢' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ color: '#10b981', fontSize: '0.82rem', marginTop: '0.2rem' }}>{s.badge}</div>
            </div>
          ))}
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {KPIS.map((kpi) => (
            <div key={kpi.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${kpi.color}33`, borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: kpi.color, marginTop: '0.4rem' }}>{kpi.value}</div>
              <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.15rem' }}>Target: {kpi.target}</div>
              <div style={{ marginTop: '0.75rem', height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <div style={{ height: '100%', borderRadius: 3, background: kpi.color, width: `${kpi.pct}%`, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ textAlign: 'right', color: '#475569', fontSize: '0.7rem', marginTop: '0.3rem' }}>{kpi.pct}%</div>
            </div>
          ))}
        </div>

        {/* Phase Summary */}
        <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Platform Phases — V1.0 Complete</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {['Phase 0\nIdentity', 'Phase 1\nAIOS Core', 'Phase 2\nStudio', 'Phase 3\nRendering', 'Phase 4\nPublishing', 'Phase 5\nEnterprise', 'Phase 6\nProduction'].map((p, i) => (
              <div key={p} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '0.75rem', textAlign: 'center', fontSize: '0.72rem', color: '#6ee7b7' }}>
                ✅ {p.split('\n').map((line, j) => <div key={j} style={{ fontWeight: j === 0 ? 700 : 400 }}>{line}</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
