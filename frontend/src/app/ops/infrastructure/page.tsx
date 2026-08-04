'use client';

export default function InfrastructurePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>⚙️ Infrastructure Dashboard</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Kubernetes · Autoscaling · Predictive Scaling · Multi-Region</p>

        {/* Cluster KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Backend Pods', value: '8 / 50', sub: 'HPA: 2–50 replicas', color: '#6366f1' },
            { label: 'Frontend Pods', value: '4 / 20', sub: 'HPA: 2–20 replicas', color: '#06b6d4' },
            { label: 'Current Load', value: '1,680 rps', sub: 'Predicted 15m: 1,920', color: '#f59e0b' },
            { label: 'Scale Direction', value: '↑ UP', sub: '2 pods scheduled', color: '#10b981' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.color}33`, borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: '0.3rem' }}>{s.value}</div>
              <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Kubernetes Resources */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Kubernetes Resource Allocation</h2>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Component', 'Replicas', 'CPU Request', 'Memory Request', 'Strategy'].map((h) => (
                  <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Backend API', replicas: '8', cpu: '4,000m', mem: '4Gi', strategy: 'Rolling Update' },
                { name: 'Frontend', replicas: '4', cpu: '800m', mem: '1Gi', strategy: 'Rolling Update' },
                { name: 'Render Worker', replicas: '12', cpu: '24,000m', mem: '48Gi', strategy: 'Spot + On-Demand' },
                { name: 'BullMQ Worker', replicas: '6', cpu: '3,000m', mem: '6Gi', strategy: 'Rolling Update' },
              ].map((r, i) => (
                <tr key={r.name} style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#a5b4fc' }}>{r.replicas}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.cpu}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.mem}</td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#6ee7b7', fontSize: '0.82rem' }}>{r.strategy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Deployment */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { title: 'Deployment Strategy', value: 'Blue/Green + Canary', icon: '🚦', desc: '10% canary before full promote' },
            { title: 'Image Registry', value: 'GHCR + ECR', icon: '📦', desc: 'Multi-registry with Trivy scanning' },
            { title: 'Helm Chart', value: 'v1.0.0', icon: '⎈', desc: '6-region overlay with production values' },
          ].map((c) => (
            <div key={c.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>{c.title}</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', marginTop: '0.25rem' }}>{c.value}</div>
              <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.25rem' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
