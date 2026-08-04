'use client';

const METRICS = [
  { label: 'API p50 Latency', value: '87ms', status: 'ok' },
  { label: 'API p95 Latency', value: '142ms', status: 'ok', target: '< 200ms' },
  { label: 'API p99 Latency', value: '298ms', status: 'warn' },
  { label: 'AI Provider p95', value: '1.82s', status: 'ok' },
  { label: 'Render Queue Depth', value: '23', status: 'ok' },
  { label: 'Active Workers', value: '12', status: 'ok' },
  { label: 'Error Rate', value: '0.12%', status: 'ok' },
  { label: 'GPU Utilization', value: '68%', status: 'ok' },
  { label: 'Memory Usage', value: '71%', status: 'ok' },
  { label: 'CPU Usage', value: '54%', status: 'ok' },
];

const ALERTS = [
  { severity: 'warning', message: 'API p99 latency elevated at 298ms (target < 500ms)', time: '5m ago' },
];

export default function ObservabilityPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📊 Observability Dashboard</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Real-time metrics, traces, and alerts — Prometheus + Grafana + Jaeger + Loki</p>

        {/* Active Alerts */}
        {ALERTS.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Active Alerts</h2>
            {ALERTS.map((a, i) => (
              <div key={i} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚠️ <strong style={{ color: '#f59e0b' }}>[{a.severity.toUpperCase()}]</strong> {a.message}</span>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{a.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Metrics Grid */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>System Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.875rem', marginBottom: '2rem' }}>
          {METRICS.map((m) => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${m.status === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 12, padding: '1rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.3rem', color: m.status === 'ok' ? '#10b981' : '#f59e0b' }}>{m.value}</div>
              {m.target && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.2rem' }}>{m.target}</div>}
            </div>
          ))}
        </div>

        {/* Trace Summary */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Distributed Tracing (Jaeger)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Completed Spans', value: '48,221' },
            { label: 'Active Spans', value: '14' },
            { label: 'Error Spans', value: '7', warn: true },
            { label: 'Slow Spans (>200ms)', value: '23', warn: true },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.warn ? '#f59e0b' : '#a5b4fc', marginTop: '0.3rem' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '1.25rem', color: '#a5b4fc', fontSize: '0.88rem' }}>
          📡 Metrics endpoint: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>/api/platform/observability/metrics/prometheus</code> &nbsp;|&nbsp;
          Grafana dashboards available at <strong>grafana.storyforge.ai</strong> &nbsp;|&nbsp; Traces at <strong>jaeger.storyforge.ai</strong>
        </div>
      </div>
    </div>
  );
}
