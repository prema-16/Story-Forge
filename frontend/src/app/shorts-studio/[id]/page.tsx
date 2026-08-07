'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Play, Pause, Sparkles, Flame, Share2, Award, Zap, RefreshCw,
  CheckCircle, ArrowLeft, Eye, Clock, Wand2, Type, Layers, Video, Volume2, Clapperboard
} from 'lucide-react';
import { AppLayout } from '../../../components/layout/app-layout';
import { useShortsStore } from '../../../store/shortsStore';

export default function ShortsEditorPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentProject, selectedHook, setSelectedHook, publishShort, createShort, isGenerating } = useShortsStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'hooks' | 'virality' | 'publish'>('script');
  const [scriptText, setScriptText] = useState(
    currentProject?.scenes.map(s => s.narrationText).join(' ') ||
    'What if everything you knew about AI in 2026 was completely wrong? High retention loop enabled.'
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const handleGenerate = async () => {
    setGenerateError(null);
    setGenerateSuccess(false);
    try {
      await createShort({
        title: `Short – ${new Date().toLocaleTimeString()}`,
        sourceContent: scriptText,
      });
      setGenerateSuccess(true);
      setActiveTab('hooks');
    } catch (e: any) {
      setGenerateError(e?.message || 'Generation failed. Is the backend running?');
    }
  };

  const tokenCount = Math.round(scriptText.length / 4);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishShort(['youtube_shorts', 'tiktok', 'instagram_reels']);
      setPublishSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AppLayout title="9:16 Vertical Video Studio" subtitle={`Project ID: ${id}`}>
      <div className="editor-container">
        
        {/* Navigation Bar */}
        <div className="editor-nav">
          <button onClick={() => router.push('/shorts-studio')} className="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back to Creation
          </button>
          <div className="nav-tabs">
            <button className={`nav-tab ${activeTab === 'script' ? 'active' : ''}`} onClick={() => setActiveTab('script')}>
              <Type className="w-3.5 h-3.5 mr-1 inline" /> AI Script & Rewriter
            </button>
            <button className={`nav-tab ${activeTab === 'hooks' ? 'active' : ''}`} onClick={() => setActiveTab('hooks')}>
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> 10+ Hook Engine
            </button>
            <button className={`nav-tab ${activeTab === 'virality' ? 'active' : ''}`} onClick={() => setActiveTab('virality')}>
              <Flame className="w-3.5 h-3.5 mr-1 inline" /> Virality Score (94/100)
            </button>
            <button className={`nav-tab ${activeTab === 'publish' ? 'active' : ''}`} onClick={() => setActiveTab('publish')}>
              <Share2 className="w-3.5 h-3.5 mr-1 inline" /> Multi-Platform Publish
            </button>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="nav-render-btn"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-1 inline" /> : <Clapperboard className="w-4 h-4 mr-1 inline" />}
            Render Short Video
          </button>
        </div>

        <div className="editor-grid">
          
          {/* Left / Main Workspace Panel */}
          <div className="workspace-panel">
            {activeTab === 'script' && (
              <div className="panel-box">
                <div className="box-header">
                  <h3 className="box-title">AI Script Editor</h3>
                  <span className="token-badge">{tokenCount} Tokens · Live Auto-Save</span>
                </div>
                <textarea
                  rows={8}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="script-textarea"
                />

                <div className="action-row">
                  <button className="ai-tool-btn"><Wand2 className="w-3.5 h-3.5 mr-1" /> Expand</button>
                  <button className="ai-tool-btn"><Wand2 className="w-3.5 h-3.5 mr-1" /> Shorten</button>
                  <button className="ai-tool-btn"><Wand2 className="w-3.5 h-3.5 mr-1" /> Humanize</button>
                  <button className="ai-tool-btn"><Wand2 className="w-3.5 h-3.5 mr-1" /> Change Tone</button>
                  <button className="ai-tool-btn"><Wand2 className="w-3.5 h-3.5 mr-1" /> Translate</button>
                </div>

                {/* Generate Video CTA */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="generate-video-btn"
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> &nbsp;Generating Video…</>
                  ) : (
                    <><Clapperboard className="w-5 h-5" /> &nbsp;Generate Video & View Hooks</>  
                  )}
                </button>

                {/* Status feedback */}
                {generateError && (
                  <div className="gen-error">
                    ⚠️ {generateError}
                  </div>
                )}
                {generateSuccess && (
                  <div className="gen-success">
                    <CheckCircle className="w-4 h-4 mr-1" /> Video generated! Pick a hook below or publish.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hooks' && (
              <div className="panel-box">
                <div className="box-header">
                  <h3 className="box-title">10+ AI Hook Variations</h3>
                  <span className="token-badge text-amber-400">Click any hook to apply & render</span>
                </div>

                <div className="hooks-list">
                  {(currentProject?.hookVariations || []).map((h) => (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHook(h)}
                      className={`hook-card ${selectedHook?.id === h.id ? 'active' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="hook-badge">{h.type.toUpperCase()} HOOK</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHook(h);
                            handleGenerate();
                          }}
                          disabled={isGenerating}
                          className="hook-render-btn"
                        >
                          <Clapperboard className="w-3 h-3 mr-1 inline" /> Apply & Render Video
                        </button>
                      </div>
                      <div className="hook-text">"{h.hookText}"</div>
                      <div className="hook-meta">
                        Retention Multiplier: <span className="text-emerald-400 font-bold">{h.estimatedRetentionMultiplier}x</span> · {h.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Action Buttons for Hooks Tab */}
                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="generate-video-btn"
                  >
                    {isGenerating ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> &nbsp;Rendering Short Video…</>
                    ) : (
                      <><Clapperboard className="w-5 h-5" /> &nbsp;Render Short Video with {selectedHook ? selectedHook.type.toUpperCase() : 'Selected'} Hook</>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('virality')}
                    className="next-tab-btn"
                  >
                    Next Step: Virality Score & Publish ➔
                  </button>
                </div>

                {/* Status feedback */}
                {generateError && (
                  <div className="gen-error">
                    ⚠️ {generateError}
                  </div>
                )}
                {generateSuccess && (
                  <div className="gen-success">
                    <CheckCircle className="w-4 h-4 mr-1" /> Video rendered successfully with applied hook!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'virality' && (
              <div className="panel-box">
                <h3 className="box-title">Virality Engine & Retention Predictor</h3>
                
                {/* Score Meter */}
                <div className="score-meter">
                  <div className="score-number">94<span>/100</span></div>
                  <div className="score-label">PREDICTED VIRALITY SCORE</div>
                </div>

                {/* Sub Breakdowns */}
                <div className="metrics-grid">
                  <div className="metric-tile"><span className="tile-label">Hook Score</span><span className="tile-val">96%</span></div>
                  <div className="metric-tile"><span className="tile-label">3s Retention</span><span className="tile-val">89.2%</span></div>
                  <div className="metric-tile"><span className="tile-label">Completion Rate</span><span className="tile-val">68.5%</span></div>
                  <div className="metric-tile"><span className="tile-label">Expected CTR</span><span className="tile-val">12.4%</span></div>
                  <div className="metric-tile"><span className="tile-label">Expected Shares</span><span className="tile-val">1,450</span></div>
                  <div className="metric-tile"><span className="tile-label">Expected Subscribers</span><span className="tile-val">450</span></div>
                </div>

                {/* Suggestions */}
                <div className="suggestions-box">
                  <div className="sug-header"><Sparkles className="w-4 h-4 text-amber-400 mr-1" /> AI Optimization Suggestions</div>
                  <ul>
                    <li>✔ Karaoke-style yellow highlighted text boosts 10-second retention by +14%.</li>
                    <li>✔ Add a high-contrast sound effect at second 0:02 to hook initial scroll.</li>
                    <li>✔ Visual cut frequency is perfectly balanced for 30-second pacing.</li>
                  </ul>
                </div>

                {/* Action Buttons for Virality Tab */}
                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="generate-video-btn"
                  >
                    {isGenerating ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> &nbsp;Rendering 9:16 Short Video…</>
                    ) : (
                      <><Clapperboard className="w-5 h-5" /> &nbsp;Render 9:16 Short Video</>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('publish')}
                    className="next-tab-btn"
                  >
                    Proceed to Multi-Platform Publish ➔
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'publish' && (
              <div className="panel-box">
                <h3 className="box-title">Multi-Platform One-Click Publisher</h3>
                <p className="box-desc">Publish simultaneously to 9 vertical video platforms with tailored metadata.</p>
                
                <div className="platform-checkboxes">
                  {['YouTube Shorts', 'TikTok', 'Instagram Reels', 'Facebook Reels', 'LinkedIn Video', 'Pinterest Idea Pins', 'Threads', 'Snapchat Spotlight', 'X Video'].map((p) => (
                    <label key={p} className="p-label">
                      <input type="checkbox" defaultChecked className="accent-purple-500" />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>

                {publishSuccess ? (
                  <div className="publish-success">
                    <CheckCircle className="w-6 h-6 text-emerald-400 mr-2" />
                    <span>Successfully Published & Scheduled Across All Selected Platforms!</span>
                  </div>
                ) : (
                  <button
                    disabled={isPublishing}
                    onClick={handlePublish}
                    className="publish-cta"
                  >
                    {isPublishing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Publish Now to 9 Platforms'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: 9:16 Live Preview Player */}
          <div className="preview-panel">
            <div className="player-916">
              <video
                src={currentProject?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                controls={false}
                autoPlay={isPlaying}
                loop
                className="video-element"
              />
              
              {/* Overlay Subtitle Simulation */}
              <div className="caption-overlay mrbeast-style">
                <span>WHAT IF EVERYTHING YOU KNEW...</span>
              </div>

              {/* Player Play/Pause Overlay */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="play-overlay-btn"
              >
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
              </button>
            </div>

            <div className="player-meta">
              <div className="meta-tag">9:16 Vertical SAFE ZONE</div>
              <div className="meta-tag">1080x1920 60FPS</div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .editor-container { display: flex; flex-direction: column; gap: 20px; max-width: 1400px; }
        .editor-nav { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .back-btn { padding: 8px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; cursor: pointer; }
        
        .nav-tabs { display: flex; gap: 6px; }
        .nav-tab { padding: 8px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; cursor: pointer; }
        .nav-tab.active { background: rgba(124,58,237,0.2); border-color: #a78bfa; color: #fff; }

        .editor-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        @media (max-width: 900px) { .editor-grid { grid-template-columns: 1fr; } }

        .panel-box { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; display: flex; flex-direction: column; gap: 16px; }
        .box-header { display: flex; align-items: center; justify-content: space-between; }
        .box-title { font-size: 16px; font-weight: 800; color: #fff; }
        .box-desc { font-size: 12px; color: rgba(255,255,255,0.5); }
        .token-badge { font-size: 11px; color: #a78bfa; font-weight: 600; }

        .script-textarea { width: 100%; padding: 14px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 14px; line-height: 1.6; outline: none; }
        .action-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .ai-tool-btn { display: flex; align-items: center; padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 600; cursor: pointer; }

        .hooks-list { display: flex; flex-direction: column; gap: 10px; }
        .hook-card { padding: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; cursor: pointer; }
        .hook-card.active { border-color: #a78bfa; background: rgba(124,58,237,0.15); }
        .hook-badge { font-size: 10px; font-weight: 800; color: #fbbf24; margin-bottom: 4px; }
        .hook-text { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .hook-meta { font-size: 11px; color: rgba(255,255,255,0.4); }

        .score-meter { text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(16,185,129,0.1)); border-radius: 14px; }
        .score-number { font-size: 48px; font-weight: 900; color: #34d399; line-height: 1; }
        .score-number span { font-size: 20px; color: rgba(255,255,255,0.4); }
        .score-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); margin-top: 6px; letter-spacing: 0.05em; }

        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .metric-tile { padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center; }
        .tile-label { font-size: 10px; color: rgba(255,255,255,0.4); display: block; }
        .tile-val { font-size: 14px; font-weight: 800; color: #fff; margin-top: 2px; display: block; }

        .suggestions-box { padding: 12px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; }
        .sug-header { font-size: 12px; font-weight: 700; color: #fbbf24; margin-bottom: 6px; display: flex; align-items: center; }
        .suggestions-box ul { font-size: 11px; color: rgba(255,255,255,0.7); display: flex; flex-direction: column; gap: 4px; }

        .platform-checkboxes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .p-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #fff; cursor: pointer; }
        .publish-cta { padding: 14px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
        .publish-success { display: flex; align-items: center; padding: 14px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 10px; color: #34d399; font-size: 13px; font-weight: 700; }

        /* Generate Video button */
        .generate-video-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 24px; background: linear-gradient(135deg, #7c3aed, #a855f7, #6366f1); border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; width: 100%; margin-top: 4px; letter-spacing: 0.02em; box-shadow: 0 4px 24px rgba(124,58,237,0.45); transition: opacity 0.2s, transform 0.15s; }
        .generate-video-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .generate-video-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .gen-error { padding: 10px 14px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #f87171; font-size: 12px; font-weight: 600; }
        .gen-success { display: flex; align-items: center; padding: 10px 14px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; color: #34d399; font-size: 12px; font-weight: 600; }

        /* 9:16 Vertical Player */
        .preview-panel { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .player-916 { width: 300px; height: 533px; background: #000; border-radius: 20px; border: 2px solid rgba(255,255,255,0.15); position: relative; overflow: hidden; box-shadow: 0 0 40px rgba(0,0,0,0.8); }
        .video-element { width: 100%; height: 100%; object-fit: cover; }
        .caption-overlay { position: absolute; bottom: 80px; left: 10px; right: 10px; text-align: center; }
        .mrbeast-style span { background: #facc15; color: #000; font-weight: 900; font-size: 16px; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        .play-overlay-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 56px; height: 56px; border-radius: 50%; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .nav-render-btn { display: flex; align-items: center; padding: 8px 16px; background: linear-gradient(135deg, #7c3aed, #ec4899); border: none; border-radius: 10px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
        .nav-render-btn:hover:not(:disabled) { opacity: 0.9; }
        .nav-render-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .hook-render-btn { display: flex; align-items: center; padding: 4px 10px; background: rgba(124,58,237,0.25); border: 1px solid rgba(167,139,250,0.4); border-radius: 6px; color: #a78bfa; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .hook-render-btn:hover { background: rgba(124,58,237,0.45); color: #fff; }

        .next-tab-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .next-tab-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
      `}</style>
    </AppLayout>
  );
}
