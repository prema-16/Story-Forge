'use client';

export default function CostOptimizerPage() {
  const PROVIDERS = [
    { name: 'Gemini', cost: '$0.000001', latency: '1.2s', quality: 94, monthlyCost: '$847', selected: true },
    { name: 'Claude', cost: '$0.000015', latency: '1.8s', quality: 95, monthlyCost: '$12,705', selected: false },
    { name: 'GPT-4', cost: '$0.000030', latency: '2.2s', quality: 96, monthlyCost: '$25,410', selected: false },
    { name: 'Mistral', cost: '$0.000002', latency: '0.9s', quality: 85, monthlyCost: '$1,694', selected: false },
  ];

  const FORECAST = {
    aiCost: 4218,
    storageCost: 1847,
    computeCost: 2400,
    bandwidthCost: 1500,
    total: 9965,
    savings: 2192,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>💰 Cost Optimization Advisor</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>AI provider routing · Storage lifecycle · Monthly forecasting</p>

        {/* Monthly Forecast */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'AI Inference', value: `$${FORECAST.aiCost.toLocaleString()}`, color: '#6366f1' },
            { label: 'Storage', value: `$${FORECAST.storageCost.toLocaleString()}`, color: '#10b981' },
            { label: 'Compute', value: `$${FORECAST.computeCost.toLocaleString()}`, color: '#f59e0b' },
            { label: 'Bandwidth', value: `$${FORECAST.bandwidthCost.toLocaleString()}`, color: '#06b6d4' },
            { label: 'Total Monthly', value: `$${FORECAST.total.toLocaleString()}`, color: '#f1f5f9' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: '0.3rem' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.2rem' }}>per month</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>💡 Optimization Savings</div>
            <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>Storage tiering + cost routing + deduplication applied</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>${FORECAST.savings.toLocaleString()}/mo</div>
        </div>

        {/* Provider Comparison */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>AI Provider Cost Comparison</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {PROVIDERS.map((p) => (
            <div key={p.name} style={{
              background: p.selected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${p.selected ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 14, padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.name}</div>
                {p.selected && <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>✓ CURRENT ROUTE</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div><div style={{ color: '#64748b' }}>Cost/token</div><div style={{ color: '#f1f5f9', fontWeight: 600 }}>{p.cost}</div></div>
                <div><div style={{ color: '#64748b' }}>Avg latency</div><div style={{ color: '#f1f5f9', fontWeight: 600 }}>{p.latency}</div></div>
                <div><div style={{ color: '#64748b' }}>Quality</div><div style={{ color: p.quality >= 90 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{p.quality}/100</div></div>
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#64748b', fontSize: '0.8rem' }}>
                Monthly est: <strong style={{ color: '#f1f5f9' }}>{p.monthlyCost}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
