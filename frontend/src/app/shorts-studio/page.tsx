'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Zap, Flame, Play, Clock, Video, Cpu, BarChart3,
  Layers, Sliders, ArrowRight, Wand2, RefreshCw, FileText,
  Radio, Globe, MessageSquare, Music, Image as ImageIcon
} from 'lucide-react';
import { AppLayout } from '../../components/layout/app-layout';
import { useShortsStore } from '../../store/shortsStore';
import { ShortInputType, ShortDuration, VisualStyle, VideoAIProvider, SubtitleStyle } from '@storyforge/shared';

const INPUT_OPTIONS: { type: ShortInputType; label: string; icon: any; desc: string }[] = [
  { type: 'prompt', label: 'Prompt', icon: Sparkles, desc: 'Generate from single text idea' },
  { type: 'script', label: 'Script', icon: FileText, desc: 'Paste written script' },
  { type: 'long_youtube', label: 'Long YouTube', icon: Play, desc: 'Auto-cut 2hr video into shorts' },
  { type: 'podcast', label: 'Podcast', icon: Radio, desc: 'Extract podcast highlights' },
  { type: 'url', label: 'URL / Web Page', icon: Globe, desc: 'Convert web link into video' },
  { type: 'blog', label: 'Blog Post', icon: FileText, desc: 'Transform article into short' },
  { type: 'pdf', label: 'PDF Document', icon: Layers, desc: 'Summarize PDF as short' },
  { type: 'docx', label: 'DOCX Document', icon: FileText, desc: 'Import Word document' },
  { type: 'reddit', label: 'Reddit Thread', icon: MessageSquare, desc: 'Viral Reddit storytelling' },
  { type: 'x_thread', label: 'X Thread', icon: MessageSquare, desc: 'Turn X posts into shorts' },
  { type: 'audio', label: 'Audio File', icon: Music, desc: 'Speech to viral short video' },
  { type: 'storyforge_project', label: 'StoryForge Proj', icon: Video, desc: 'Re-purpose existing project' },
  { type: 'existing_script', label: 'Existing Script', icon: Sliders, desc: 'Import from script library' },
  { type: 'ai_idea', label: 'AI Trend Idea', icon: Flame, desc: 'Auto-pick viral daily trend' },
];

const DURATIONS: ShortDuration[] = [15, 20, 30, 45, 60, 90];

const VISUAL_STYLES: { style: VisualStyle; label: string }[] = [
  { style: 'cyberpunk', label: 'Cyberpunk' },
  { style: 'photorealistic', label: 'Photorealistic' },
  { style: 'anime', label: 'Anime' },
  { style: 'pixar', label: 'Pixar 3D' },
  { style: 'disney', label: 'Disney Magic' },
  { style: 'comic', label: 'Comic Book' },
  { style: 'documentary', label: 'Documentary' },
  { style: 'film_noir', label: 'Film Noir' },
  { style: 'watercolor', label: 'Watercolor' },
  { style: '3d', label: 'Ultra 3D' },
];

const SUBTITLE_STYLES: { style: SubtitleStyle; label: string }[] = [
  { style: 'mrbeast', label: 'MrBeast Glowing' },
  { style: 'capcut', label: 'CapCut Bounce' },
  { style: 'tiktok', label: 'TikTok Classic' },
  { style: 'karaoke', label: 'Karaoke Highlight' },
  { style: 'netflix', label: 'Netflix Style' },
  { style: 'glow', label: 'Neon Glow' },
];

export default function ShortsStudioPage() {
  const router = useRouter();
  const {
    activeInputType, setActiveInputType,
    targetDuration, setTargetDuration,
    visualStyle, setVisualStyle,
    subtitleStyle, setSubtitleStyle,
    createShort, isGenerating
  } = useShortsStore();

  const [title, setTitle] = useState('');
  const [sourceContent, setSourceContent] = useState('');

  const handleGenerate = async () => {
    if (!title) return;
    try {
      const proj = await createShort({ title, sourceContent });
      router.push(`/shorts-studio/${proj._id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout title="AI Shorts Studio" subtitle="Enterprise Viral Short Video Platform (YouTube Shorts, TikTok, Reels)">
      <div className="shorts-studio-container">
        
        {/* Header Hero Banner */}
        <div className="hero-banner">
          <div className="hero-badge">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>PHASE 7 ENGINE ACTIVE · 9:16 VERTICAL STACK</span>
          </div>
          <h1 className="hero-title">
            Transform Any Content Into <span className="gradient-text">Viral 9:16 Shorts</span>
          </h1>
          <p className="hero-desc">
            Powered by 22-agent swarm, 17 AI hook categories, 0-100 Virality Predictor, and multi-platform distribution.
          </p>
        </div>

        {/* 14 Input Selectors */}
        <section className="input-section">
          <h2 className="section-heading">1. Select Creation Input (14 Sources)</h2>
          <div className="input-grid">
            {INPUT_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeInputType === item.type;
              return (
                <motion.div
                  key={item.type}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveInputType(item.type)}
                  className={`input-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="input-icon">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="input-label">{item.label}</div>
                    <div className="input-desc">{item.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Content & Settings Box */}
        <div className="settings-grid">
          {/* Main Form */}
          <div className="form-box">
            <h2 className="section-heading">2. Short Project Details</h2>
            
            <div className="field-group">
              <label className="field-label">Short Title / Main Concept</label>
              <input
                type="text"
                placeholder="e.g. 3 AI Breakthroughs That Change Everything in 2026..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="custom-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Source Content / Prompt / URL</label>
              <textarea
                rows={4}
                placeholder="Paste your prompt, script, transcript, blog text, or URL here..."
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                className="custom-textarea"
              />
            </div>

            {/* Durations */}
            <div className="field-group">
              <div className="flex items-center justify-between">
                <label className="field-label">Target Duration (With Custom Pacing Model)</label>
                <button
                  type="button"
                  onClick={() => setTargetDuration(30)}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-full text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  ⚡ Quick 30-Sec Viral Mode
                </button>
              </div>
              <div className="duration-pills mt-2">
                {DURATIONS.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTargetDuration(sec)}
                    className={`pill-btn ${targetDuration === sec ? 'active' : ''}`}
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    {sec === 30 ? '30s (Recommended)' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style */}
            <div className="field-group">
              <label className="field-label">AI Visual Style (14 Styles)</label>
              <div className="style-grid">
                {VISUAL_STYLES.map((v) => (
                  <button
                    key={v.style}
                    onClick={() => setVisualStyle(v.style)}
                    className={`style-btn ${visualStyle === v.style ? 'active' : ''}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Style */}
            <div className="field-group">
              <label className="field-label">Subtitle Caption Style</label>
              <div className="style-grid">
                {SUBTITLE_STYLES.map((s) => (
                  <button
                    key={s.style}
                    onClick={() => setSubtitleStyle(s.style)}
                    className={`style-btn ${subtitleStyle === s.style ? 'active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate CTA */}
            <button
              disabled={isGenerating || !title}
              onClick={handleGenerate}
              className="generate-cta"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Generating 9:16 Short...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Viral Short Now (12 Credits)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Quick Actions & Navigation Cards */}
          <div className="side-cards">
            <div className="quick-card pointer" onClick={() => router.push('/shorts-studio/batch')}>
              <Layers className="w-6 h-6 text-purple-400 mb-2" />
              <h3>Batch Generator</h3>
              <p>Generate 10, 20, 50, 100 or 500 Shorts automatically in parallel.</p>
              <span className="card-link">Launch Batch Queue →</span>
            </div>

            <div className="quick-card pointer" onClick={() => router.push('/shorts-studio/playground')}>
              <Cpu className="w-6 h-6 text-amber-400 mb-2" />
              <h3>AI Playground</h3>
              <p>Compare Runway, Kling, Pika, Veo & Sora latency and visual quality.</p>
              <span className="card-link">Open Playground →</span>
            </div>

            <div className="quick-card pointer" onClick={() => router.push('/shorts-studio/analytics')}>
              <BarChart3 className="w-6 h-6 text-emerald-400 mb-2" />
              <h3>Virality Analytics</h3>
              <p>Real-time 3s/10s retention curve simulation & platform performance.</p>
              <span className="card-link">View Analytics →</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shorts-studio-container { display: flex; flex-direction: column; gap: 24px; max-width: 1400px; }
        .hero-banner { padding: 24px; background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.06)); border: 1px solid rgba(124,58,237,0.2); border-radius: 16px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); border-radius: 20px; font-size: 11px; font-weight: 700; color: #fbbf24; margin-bottom: 12px; }
        .hero-title { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-desc { color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 6px; }

        .section-heading { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
        .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
        .input-card { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; cursor: pointer; transition: all 0.15s; }
        .input-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); }
        .input-card.selected { background: rgba(124,58,237,0.15); border-color: rgba(167,139,250,0.5); box-shadow: 0 0 16px rgba(124,58,237,0.2); }
        .input-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(124,58,237,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .input-label { font-size: 13px; font-weight: 700; color: #fff; }
        .input-desc { font-size: 10px; color: rgba(255,255,255,0.4); }

        .settings-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }

        .form-box { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; display: flex; flex-direction: column; gap: 18px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .custom-input, .custom-textarea { width: 100%; padding: 12px 14px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 13px; outline: none; }
        .custom-input:focus, .custom-textarea:focus { border-color: #a78bfa; box-shadow: 0 0 12px rgba(167,139,250,0.2); }

        .duration-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .pill-btn { padding: 8px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .pill-btn.active { background: #7c3aed; color: #fff; border-color: #a78bfa; box-shadow: 0 0 16px rgba(124,58,237,0.4); }

        .style-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 6px; }
        .style-btn { padding: 8px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 600; text-align: center; cursor: pointer; }
        .style-btn.active { background: rgba(124,58,237,0.25); border-color: #a78bfa; color: #fff; }

        .generate-cta { width: 100%; padding: 14px; background: linear-gradient(135deg, #7c3aed, #ec4899); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 24px rgba(124,58,237,0.3); margin-top: 10px; }
        .generate-cta:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 32px rgba(124,58,237,0.5); }
        .generate-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        .side-cards { display: flex; flex-direction: column; gap: 12px; }
        .quick-card { padding: 20px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; cursor: pointer; transition: all 0.2s; }
        .quick-card:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); transform: translateY(-2px); }
        .quick-card h3 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .quick-card p { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
        .card-link { font-size: 12px; font-weight: 700; color: #a78bfa; }
      `}</style>
    </AppLayout>
  );
}
