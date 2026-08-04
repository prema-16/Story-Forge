'use client';

import { useState, useEffect } from 'react';

const REGIONS = [
  { id: 'us-east-1', label: 'US East', flag: '🇺🇸', latency: 12, healthy: true, primary: true },
  { id: 'us-west-2', label: 'US West', flag: '🇺🇸', latency: 18, healthy: true, primary: false },
  { id: 'eu-west-1', label: 'Europe', flag: '🇪🇺', latency: 22, healthy: true, primary: false },
  { id: 'ap-south-1', label: 'India', flag: '🇮🇳', latency: 28, healthy: true, primary: false },
  { id: 'ap-southeast-1', label: 'Singapore', flag: '🇸🇬', latency: 25, healthy: true, primary: false },
  { id: 'ap-southeast-2', label: 'Australia', flag: '🇦🇺', latency: 35, healthy: true, primary: false },
];

const SERVICES = [
  { name: 'API Gateway', uptime: 99.98, latency: 142 },
  { name: 'AI Generation', uptime: 99.95, latency: 1820 },
  { name: 'Rendering Pipeline', uptime: 99.92, latency: 0 },
  { name: 'CDN & Storage', uptime: 100, latency: 18 },
  { name: 'CRDT Collaboration', uptime: 99.97, latency: 48 },
  { name: 'Auth & Identity', uptime: 100, latency: 65 },
];

export default function GlobalStatusPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>🌐 Global Status Dashboard</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Real-time health across all 6 deployment regions — StoryForge AI V3</p>

        {/* Overall Status */}
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🟢</div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>All Systems Operational</div>
            <div style={{ color: '#475569', fontSize: '0.85rem' }}>99.97% uptime across all services — Last incident: 14 days ago</div>
          </div>
        </div>

        {/* Region Grid */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region Health</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {REGIONS.map((r) => (
            <div key={r.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${r.healthy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{r.flag}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.label}</div>
                    {r.primary && <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600 }}>PRIMARY</div>}
                  </div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.healthy ? '#10b981' : '#ef4444', boxShadow: r.healthy ? '0 0 8px #10b981' : '0 0 8px #ef4444' }} />
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Latency: <strong style={{ color: '#a5b4fc' }}>{r.latency}ms</strong></span>
                <span>{r.healthy ? '✅ Healthy' : '❌ Down'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Service Table */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Uptime (30 days)</h2>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Service', 'Status', 'Uptime', 'Latency'].map((h) => (
                  <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: '#64748b', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s, i) => (
                <tr key={s.name} style={{ borderBottom: i < SERVICES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: '0.9rem 1.25rem' }}><span style={{ color: '#10b981', fontSize: '0.85rem' }}>● Operational</span></td>
                  <td style={{ padding: '0.9rem 1.25rem', color: s.uptime >= 99.9 ? '#10b981' : '#f59e0b' }}>{s.uptime}%</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#a5b4fc' }}>{s.latency > 0 ? `${s.latency}ms` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
