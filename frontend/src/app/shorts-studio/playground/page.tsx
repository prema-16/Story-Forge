'use client';

import React, { useState } from 'react';
import { Cpu, Zap, ArrowLeft, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '../../../components/layout/app-layout';

const PROVIDERS = [
  { id: 'runway', name: 'Runway Gen-3 Alpha', latency: '4.2s', cost: '$0.04/sec', quality: '98/100' },
  { id: 'kling', name: 'Kling AI 1.5 High-Def', latency: '3.8s', cost: '$0.03/sec', quality: '97/100' },
  { id: 'pika', name: 'Pika 2.0 Pro', latency: '2.9s', cost: '$0.025/sec', quality: '95/100' },
  { id: 'google_veo', name: 'Google Veo 4K', latency: '5.1s', cost: '$0.05/sec', quality: '99/100' },
  { id: 'openai_sora', name: 'OpenAI Sora Turbo', latency: '3.5s', cost: '$0.045/sec', quality: '99/100' },
  { id: 'luma', name: 'Luma Dream Machine 1.5', latency: '3.1s', cost: '$0.03/sec', quality: '96/100' },
];

export default function ShortsPlaygroundPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('Photorealistic 9:16 vertical tracking shot of futuristic neon cyberpunk city in rain, 8k resolution, cinematic lighting');
  const [isTesting, setIsTesting] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleTestRun = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setHasRun(true);
    }, 1200);
  };

  return (
    <AppLayout title="AI Video Provider Playground" subtitle="Compare latency, cost per second, and visual generation quality across 6 AI engines">
      <div className="playground-container">
        
        <button onClick={() => router.push('/shorts-studio')} className="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back to Shorts Studio
        </button>

        <div className="playground-box">
          <h2 className="box-title"><Cpu className="w-5 h-5 text-amber-400 mr-2 inline" /> Prompt Testing Sandbox</h2>
          
          <div className="field-group">
            <label className="field-label">Test Visual Prompt</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="custom-textarea"
            />
          </div>

          <button onClick={handleTestRun} disabled={isTesting} className="test-cta">
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Execute Multi-Provider Benchmark
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="providers-grid">
          {PROVIDERS.map((p) => (
            <div key={p.id} className="provider-card">
              <div className="p-header">
                <div className="p-name">{p.name}</div>
                {hasRun && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              
              <div className="p-stats">
                <div className="p-stat"><span>LATENCY</span><strong>{p.latency}</strong></div>
                <div className="p-stat"><span>COST</span><strong>{p.cost}</strong></div>
                <div className="p-stat"><span>QUALITY</span><strong className="text-emerald-400">{p.quality}</strong></div>
              </div>

              {hasRun && (
                <div className="sample-output">
                  <div className="sample-badge">GEN-RESULT READY</div>
                  <video
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    autoPlay
                    muted
                    loop
                    className="sample-video"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .playground-container { display: flex; flex-direction: column; gap: 20px; max-width: 1400px; }
        .back-btn { align-self: flex-start; padding: 8px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; cursor: pointer; }
        
        .playground-box { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; display: flex; flex-direction: column; gap: 16px; }
        .box-title { font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .custom-textarea { width: 100%; padding: 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 13px; outline: none; }
        
        .test-cta { align-self: flex-start; padding: 12px 24px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 10px; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; cursor: pointer; }

        .providers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
        .provider-card { padding: 20px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; display: flex; flex-direction: column; gap: 12px; }
        .p-header { display: flex; justify-content: space-between; align-items: center; }
        .p-name { font-size: 14px; font-weight: 800; color: #fff; }

        .p-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; }
        .p-stat { text-align: center; }
        .p-stat span { font-size: 9px; color: rgba(255,255,255,0.4); display: block; }
        .p-stat strong { font-size: 12px; color: #fff; display: block; margin-top: 2px; }

        .sample-output { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
        .sample-badge { font-size: 10px; font-weight: 800; color: #34d399; }
        .sample-video { width: 100%; height: 160px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
    </AppLayout>
  );
}
