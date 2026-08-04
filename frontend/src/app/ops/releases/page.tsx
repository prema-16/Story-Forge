'use client';

export default function ReleasesPage() {
  const PIPELINE_STAGES = [
    { name: 'Build', status: 'pass', duration: '2m 18s', time: '14:05 UTC' },
    { name: 'Lint + TypeCheck', status: 'pass', duration: '45s', time: '14:07 UTC' },
    { name: 'Unit Tests', status: 'pass', duration: '1m 32s', time: '14:08 UTC' },
    { name: 'Security Scan', status: 'pass', duration: '1m 10s', time: '14:10 UTC' },
    { name: 'Container Build + Trivy', status: 'pass', duration: '3m 44s', time: '14:11 UTC' },
    { name: 'Deploy Canary (10%)', status: 'pass', duration: '5m 02s', time: '14:15 UTC' },
    { name: 'Canary Health Check', status: 'pass', duration: '5m 00s', time: '14:20 UTC' },
    { name: 'Promote to Production', status: 'running', duration: '...', time: '14:20 UTC' },
  ];

  const RECENT_RELEASES = [
    { version: 'v3.5.2', env: 'production', sha: 'a4f2c8d', date: '2026-08-01', status: 'deployed', notes: 'Phase 6 Production Hardening' },
    { version: 'v3.5.1', env: 'production', sha: 'b8e1a3f', date: '2026-07-28', status: 'deployed', notes: 'Performance optimization patches' },
    { version: 'v3.5.0', env: 'production', sha: 'c2d9b1e', date: '2026-07-20', status: 'deployed', notes: 'Phase 5 Enterprise features' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🚀 Release Pipeline</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>CI/CD status · Canary deployments · Release history · Rollback</p>

        {/* Active Pipeline */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Active Pipeline — <span style={{ color: '#a5b4fc' }}>SHA: a4f2c8d (Phase 6)</span></h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${stage.status === 'running' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10, padding: '0.75rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.status === 'pass' ? '#10b981' : stage.status === 'running' ? '#6366f1' : '#64748b', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{stage.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.82rem', color: '#64748b' }}>
                <span>{stage.duration}</span>
                <span>{stage.time}</span>
                <span style={{ color: stage.status === 'pass' ? '#10b981' : stage.status === 'running' ? '#a5b4fc' : '#64748b', fontWeight: 600 }}>
                  {stage.status === 'pass' ? '✅ PASS' : stage.status === 'running' ? '⏳ RUNNING' : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Release History */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Release History</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {RECENT_RELEASES.map((r) => (
            <div key={r.version} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <code style={{ color: '#a5b4fc', fontWeight: 700 }}>{r.version}</code>
                <code style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.sha}</code>
                <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{r.notes}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>{r.date}</span>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '0.2rem 0.75rem', fontWeight: 600 }}>
                  ✅ {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
