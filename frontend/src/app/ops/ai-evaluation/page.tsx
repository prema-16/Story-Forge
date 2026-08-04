'use client';

export default function AIEvaluationPage() {
  const EVAL_RESULTS = [
    { prompt: 'Documentary intro about quantum computing', faithfulness: 88, relevance: 92, safety: 99, creativity: 81, coherence: 90, overall: 90 },
    { prompt: 'Viral tech thumbnail: AI vs jobs', faithfulness: 85, relevance: 95, safety: 98, creativity: 89, coherence: 87, overall: 91 },
    { prompt: 'Brand safety review: educational content', faithfulness: 95, relevance: 96, safety: 100, creativity: 72, coherence: 93, overall: 91 },
  ];

  const GOLDEN_TESTS = [
    { id: 'gc_001', name: 'Documentary Intro Script', lastScore: 90, expected: '75–100', status: 'pass' },
    { id: 'gc_002', name: 'Viral Tech Thumbnail', lastScore: 91, expected: '70–100', status: 'pass' },
    { id: 'gc_003', name: 'Brand Safety Review', lastScore: 91, expected: '85–100', status: 'pass' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🤖 AI Evaluation Center</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Prompt quality · Video scoring · Hallucination detection · Regression tests</p>

        {/* Score Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Avg Faithfulness', value: '89%', color: '#6366f1' },
            { label: 'Avg Relevance', value: '94%', color: '#10b981' },
            { label: 'Avg Safety Score', value: '99%', color: '#10b981' },
            { label: 'Hallucination Rate', value: '0.8%', color: '#f59e0b' },
            { label: 'Regression Pass Rate', value: '100%', color: '#10b981' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, marginTop: '0.3rem' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Evaluation Results */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Recent Evaluations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {EVAL_RESULTS.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 500 }}>"{r.prompt}"</div>
                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '0.25rem 0.9rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                  {r.overall}/100
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {[
                  { label: 'Faithfulness', v: r.faithfulness },
                  { label: 'Relevance', v: r.relevance },
                  { label: 'Safety', v: r.safety },
                  { label: 'Creativity', v: r.creativity },
                  { label: 'Coherence', v: r.coherence },
                ].map((dim) => (
                  <div key={dim.label} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{dim.label}</span>
                      <span style={{ fontSize: '0.72rem', color: dim.v >= 85 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{dim.v}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                      <div style={{ height: '100%', borderRadius: 3, background: dim.v >= 85 ? '#10b981' : '#f59e0b', width: `${dim.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Golden Dataset */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Golden Dataset Regression Tests</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {GOLDEN_TESTS.map((t) => (
            <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <code style={{ color: '#6366f1', fontSize: '0.8rem' }}>{t.id}</code>
                <span style={{ fontSize: '0.9rem' }}>{t.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Expected: {t.expected}</span>
                <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Score: {t.lastScore}</span>
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 600 }}>✅ PASS</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
