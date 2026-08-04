'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Clock, CheckCircle2, Play, RefreshCw, ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '../../../components/layout/app-layout';
import { useShortsStore } from '../../../store/shortsStore';

const BATCH_COUNTS = [10, 20, 50, 100, 500];

export default function BatchShortsPage() {
  const router = useRouter();
  const { triggerBatchGeneration, isGenerating, batchJob } = useShortsStore();
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [topic, setTopic] = useState('Daily Tech & AI Breakthroughs');

  const handleLaunchBatch = async () => {
    try {
      await triggerBatchGeneration(selectedCount, topic);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout title="Batch Shorts Generator" subtitle="Queue and produce 10 to 500 vertical 9:16 Shorts in parallel">
      <div className="batch-container">
        
        <button onClick={() => router.push('/shorts-studio')} className="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back to Shorts Studio
        </button>

        <div className="batch-grid">
          
          {/* Controls Box */}
          <div className="batch-box">
            <h2 className="box-heading"><Layers className="w-5 h-5 text-purple-400 mr-2 inline" /> Batch Configuration</h2>
            
            <div className="field-group">
              <label className="field-label">Batch Niche / Core Theme</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="custom-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Select Quantity of Shorts to Produce</label>
              <div className="count-pills">
                {BATCH_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setSelectedCount(cnt)}
                    className={`count-pill ${selectedCount === cnt ? 'active' : ''}`}
                  >
                    {cnt} Shorts
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Box */}
            <div className="calc-box">
              <div className="calc-row"><span>Total Shorts Requested:</span><strong>{selectedCount} Shorts</strong></div>
              <div className="calc-row"><span>Credit Cost per Short:</span><strong>12 Credits</strong></div>
              <div className="calc-row"><span>Total Credits Required:</span><strong className="text-purple-400">{selectedCount * 12} Credits</strong></div>
              <div className="calc-row"><span>Estimated Parallel Render Time:</span><strong>~{Math.round(selectedCount * 0.8)} Seconds</strong></div>
            </div>

            <button
              disabled={isGenerating}
              onClick={handleLaunchBatch}
              className="batch-cta"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Orchestrating Batch Queue ({selectedCount} Shorts)...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Launch Batch Queue for {selectedCount} Shorts
                </>
              )}
            </button>
          </div>

          {/* Queue Monitor Box */}
          <div className="batch-box">
            <h2 className="box-heading"><Clock className="w-5 h-5 text-amber-400 mr-2 inline" /> Live Batch Queue Monitor</h2>
            
            {batchJob ? (
              <div className="job-status-card">
                <div className="status-header">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mr-2" />
                  <div>
                    <div className="job-id">{batchJob.id}</div>
                    <div className="job-sub">STATUS: {batchJob.status.toUpperCase()} · 100% COMPLETED</div>
                  </div>
                </div>

                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: '100%' }} />
                </div>

                <div className="projects-list">
                  {batchJob.shortsProjects.map((p, i) => (
                    <div key={p._id} className="batch-item">
                      <div className="item-num">#{i + 1}</div>
                      <div className="item-title">{p.title}</div>
                      <div className="item-score font-bold text-emerald-400">94 Score</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-queue">
                <Layers className="w-12 h-12 text-white/10 mb-2" />
                <p>No active batch job in progress. Configure options and launch your batch queue.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <style jsx>{`
        .batch-container { display: flex; flex-direction: column; gap: 20px; max-width: 1400px; }
        .back-btn { align-self: flex-start; padding: 8px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; cursor: pointer; }
        
        .batch-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .batch-grid { grid-template-columns: 1fr; } }

        .batch-box { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; display: flex; flex-direction: column; gap: 16px; }
        .box-heading { font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; }

        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .custom-input { width: 100%; padding: 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 13px; outline: none; }

        .count-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .count-pill { padding: 10px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 700; cursor: pointer; }
        .count-pill.active { background: #7c3aed; color: #fff; border-color: #a78bfa; box-shadow: 0 0 16px rgba(124,58,237,0.4); }

        .calc-box { padding: 16px; background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 12px; display: flex; flex-direction: column; gap: 8px; }
        .calc-row { display: flex; justify-content: space-between; font-size: 12px; color: rgba(255,255,255,0.7); }

        .batch-cta { width: 100%; padding: 14px; background: linear-gradient(135deg, #7c3aed, #ec4899); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .empty-queue { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; }
        .job-status-card { display: flex; flex-direction: column; gap: 14px; }
        .status-header { display: flex; align-items: center; }
        .job-id { font-size: 14px; font-weight: 800; color: #fff; }
        .job-sub { font-size: 11px; color: rgba(255,255,255,0.4); }

        .progress-bar-track { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #34d399; }

        .projects-list { display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; }
        .batch-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 12px; }
        .item-num { color: #a78bfa; font-weight: 800; }
        .item-title { flex: 1; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
    </AppLayout>
  );
}
