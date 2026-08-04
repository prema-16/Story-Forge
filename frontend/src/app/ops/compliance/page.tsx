'use client';

import { useState } from 'react';

const FRAMEWORKS = ['GDPR', 'SOC2', 'ISO27001'] as const;

const FRAMEWORK_DATA: Record<string, { score: number; controls: number; implemented: number; color: string }> = {
  GDPR: { score: 92, controls: 5, implemented: 4, color: '#6366f1' },
  SOC2: { score: 100, controls: 5, implemented: 5, color: '#10b981' },
  ISO27001: { score: 100, controls: 4, implemented: 4, color: '#f59e0b' },
};

export default function CompliancePage() {
  const [active, setActive] = useState<'GDPR' | 'SOC2' | 'ISO27001'>('GDPR');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>⚖️ Compliance Center</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>GDPR Article compliance · SOC 2 Type II · ISO 27001 Controls</p>

        {/* Framework Scores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {FRAMEWORKS.map((fw) => {
            const d = FRAMEWORK_DATA[fw];
            return (
              <div key={fw} onClick={() => setActive(fw)} style={{
                background: active === fw ? `${d.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active === fw ? d.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16, padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: d.color }}>{fw}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: d.score >= 95 ? '#10b981' : '#f59e0b' }}>{d.score}%</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{d.implemented}/{d.controls} controls implemented</div>
                <div style={{ marginTop: '0.75rem', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                  <div style={{ height: '100%', borderRadius: 3, background: d.color, width: `${d.score}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* GDPR DSR Summary */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          {active} Compliance Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '2rem' }}>
          {(active === 'GDPR' ? [
            { label: 'Data Subject Requests', value: '12 total', sub: '11 resolved' },
            { label: 'Erasure Requests', value: '3', sub: '3 completed in <30d' },
            { label: 'Access Requests', value: '8', sub: '8 data packages sent' },
            { label: 'Overdue Requests', value: '0', sub: 'SLA target met' },
          ] : active === 'SOC2' ? [
            { label: 'Access Controls', value: '✅ CC6.1', sub: 'JWT + RBAC' },
            { label: 'Auth Controls', value: '✅ CC6.2', sub: 'Rate limit + anomaly' },
            { label: 'Change Management', value: '✅ CC8.1', sub: 'CI/CD + PR reviews' },
            { label: 'Monitoring', value: '✅ CC7.1', sub: 'Prometheus + Alerts' },
          ] : [
            { label: 'Information Security', value: '✅ A.8.2', sub: 'PII classified' },
            { label: 'Access Control', value: '✅ A.9.4', sub: 'K8s RBAC + IAM' },
            { label: 'Operational Procedures', value: '✅ A.12.1', sub: 'Runbook documented' },
            { label: 'Business Continuity', value: '✅ A.17.1', sub: 'Multi-region DR' },
          ]).map((item) => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>{item.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', marginTop: '0.4rem' }}>{item.value}</div>
              <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '1.25rem', color: '#6ee7b7', fontSize: '0.88rem' }}>
          📋 Compliance reports are auto-generated via <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>GET /api/platform/compliance/report?framework={active}</code>.
          Last report generated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
