'use client';

export default function DisasterRecoveryPage() {
  const BACKUPS = [
    { id: 'bkp_001', type: 'full', region: 'us-east-1', size: '2.4 TB', duration: '3m 2s', verified: true, createdAt: '2026-08-01T00:00:00Z' },
    { id: 'bkp_002', type: 'incremental', region: 'us-east-1', size: '44 GB', duration: '29s', verified: true, createdAt: '2026-08-01T06:00:00Z' },
    { id: 'bkp_003', type: 'incremental', region: 'eu-west-1', size: '41 GB', duration: '28s', verified: true, createdAt: '2026-08-01T12:00:00Z' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🛡️ Disaster Recovery</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Backup verification · RTO/RPO tracking · Restore simulation · Multi-region DR</p>

        {/* RTO/RPO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'RTO Target', value: '15 min', sub: 'Recovery Time Objective', color: '#6366f1' },
            { label: 'RPO Target', value: '5 min', sub: 'Recovery Point Objective', color: '#6366f1' },
            { label: 'Last RTO (Simulated)', value: '8 min', sub: '✅ Within target', color: '#10b981' },
            { label: 'Last RPO (Simulated)', value: '3 min', sub: '✅ Within target', color: '#10b981' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.color}33`, borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, marginTop: '0.3rem' }}>{s.value}</div>
              <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Backup History */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Backup History</h2>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Backup ID', 'Type', 'Region', 'Size', 'Duration', 'Verified', 'Timestamp'].map((h) => (
                  <th key={h} style={{ padding: '0.8rem 1.25rem', textAlign: 'left', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BACKUPS.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < BACKUPS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '0.8rem 1.25rem', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '0.82rem' }}>{b.id}</td>
                  <td style={{ padding: '0.8rem 1.25rem' }}>
                    <span style={{ background: b.type === 'full' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)', color: b.type === 'full' ? '#a5b4fc' : '#67e8f9', borderRadius: 20, padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      {b.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 1.25rem', color: '#94a3b8', fontSize: '0.85rem' }}>{b.region}</td>
                  <td style={{ padding: '0.8rem 1.25rem', color: '#f1f5f9' }}>{b.size}</td>
                  <td style={{ padding: '0.8rem 1.25rem', color: '#94a3b8', fontSize: '0.85rem' }}>{b.duration}</td>
                  <td style={{ padding: '0.8rem 1.25rem', color: '#10b981' }}>{b.verified ? '✅ Yes' : '❌ No'}</td>
                  <td style={{ padding: '0.8rem 1.25rem', color: '#64748b', fontSize: '0.82rem' }}>{new Date(b.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>✅ Last DR Simulation — PASSED</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Region: us-east-1 → us-west-2 failover<br />RTO: 8min | RPO: 3min | Data Loss: None</div>
          </div>
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: '0.5rem' }}>⏱ Backup Schedule</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Full backup: Daily at 00:00 UTC<br />Incremental: Every 6 hours<br />All backups cross-replicated to 3 regions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
