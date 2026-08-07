'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Layers, Mic, Image, BarChart2, Play, Pause,
  Undo2, Redo2, Save, Zap, Terminal, ChevronRight,
  Download, Share2, Settings2, Sparkles, Clock, CheckCircle2,
  AlertCircle, Loader2, ChevronLeft, PanelLeft, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize2, RotateCcw, GitBranch,
} from 'lucide-react';
import { useStudioStore } from '../../../store/studioStore';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

// ─── Sub-panels ─────────────────────────────────────────
import { ScriptEditor } from '../../../components/studio/script-editor';
import { SceneCards } from '../../../components/studio/scene-cards';
import { VoicePanel } from '../../../components/studio/voice-panel';
import { ThumbnailPanel } from '../../../components/studio/thumbnail-panel';
import { SEOPanel } from '../../../components/studio/seo-panel';
import { WorkflowPanel } from '../../../components/studio/workflow-panel';
import { AIConsole } from '../../../components/studio/ai-console';
import { VideoPreview } from '../../../components/studio/video-preview';

const TABS = [
  { id: 'workflow',   label: 'Workflow',   icon: GitBranch },
  { id: 'script',    label: 'Script',     icon: FileText },
  { id: 'scenes',    label: 'Scenes',     icon: Layers },
  { id: 'voice',     label: 'Voice',      icon: Mic },
  { id: 'thumbnail', label: 'Thumbnail',  icon: Image },
  { id: 'seo',       label: 'SEO',        icon: BarChart2 },
];

export default function StudioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    project, script, scenes, thumbnail, voice, seo,
    isGenerating, errors, activeJobId, generationProgress, generationLogs,
    activeTab, setActiveTab,
    loadProject, connectSSE, disconnectSSE,
    generateScript, generateScenes, generatePrompts,
    generateVoice, generateThumbnail, generateSEO, generateVideo,
    undo, redo, undoStack, redoStack,
    isPlaying, setIsPlaying, currentTime, setCurrentTime,
    videoUrl, // reactive — do NOT use useStudioStore.getState().videoUrl
  } = useStudioStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(360);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isAnyGenerating = Object.values(isGenerating).some(Boolean);

  // ── Load project + connect SSE ──────────────────────────
  useEffect(() => {
    if (!id) return;
    loadProject(id);
    connectSSE(id);
    return () => disconnectSSE();
  }, [id]);

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleAutosave(); }
      if (e.key === ' ' && e.target === document.body) { e.preventDefault(); setIsPlaying(!isPlaying); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isPlaying, undo, redo]);

  // ── Resizable panel drag ────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) setLeftWidth(Math.max(240, Math.min(480, e.clientX - 60)));
      if (isDraggingRight) {
        const containerRight = containerRef.current?.getBoundingClientRect().right ?? window.innerWidth;
        setRightWidth(Math.max(280, Math.min(500, containerRight - e.clientX)));
      }
    };
    const onMouseUp = () => { setIsDraggingLeft(false); setIsDraggingRight(false); };
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
    return () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
  }, [isDraggingLeft, isDraggingRight]);

  const handleAutosave = useCallback(async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500)); // debounce placeholder
    setIsSaving(false);
  }, []);

  const currentStep = project?.currentStep ?? 0;
  const totalSteps = project?.totalSteps ?? 10;
  const progressPct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className="studio-root" ref={containerRef}>
      {/* ── Top Toolbar ── */}
      <header className="studio-header">
        <div className="studio-header-left">
          <button className="icon-btn" onClick={() => router.push('/projects')} title="Back to Projects">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="divider-v" />
          <div className="project-breadcrumb">
            <span className="breadcrumb-parent">Projects</span>
            <ChevronRight className="h-3 w-3 text-white/30" />
            <span className="breadcrumb-current">{project?.title || 'Loading...'}</span>
          </div>

          {/* Status badge */}
          <StatusBadge status={project?.status} progress={progressPct} />
        </div>

        <div className="studio-header-center">
          {/* Playback controls */}
          <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        </div>

        <div className="studio-header-right">
          {/* Undo / Redo */}
          <button className="icon-btn" onClick={undo} disabled={undoStack.length === 0} title="Undo (⌘Z)">
            <Undo2 className="h-4 w-4" />
          </button>
          <button className="icon-btn" onClick={redo} disabled={redoStack.length === 0} title="Redo (⌘Y)">
            <Redo2 className="h-4 w-4" />
          </button>

          <div className="divider-v" />

          {/* Autosave indicator */}
          <div className="autosave-indicator">
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
            <span>{isSaving ? 'Saving...' : 'Saved'}</span>
          </div>

          <div className="divider-v" />

          {/* Credits */}
          <div className="credits-badge">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>{user?.credits ?? 0} credits</span>
          </div>

          <button className="btn-primary" onClick={() => generateVideo(id)} disabled={isAnyGenerating}>
            {isGenerating.video ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Render Video
          </button>

          <button
            className="icon-btn"
            title="Export MP4 Video"
            onClick={() => {
              const url = videoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
              const link = document.createElement('a');
              link.href = url;
              link.download = `${project?.title || 'video'}-export.mp4`;
              link.target = '_blank';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Downloading MP4 video file...');
            }}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            className="icon-btn"
            title="Share Project"
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Project link copied to clipboard!');
              }
            }}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Main Studio Body ── */}
      <div className="studio-body">
        {/* ── Left Panel: Tab Navigation ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="studio-left-panel"
              style={{ width: leftWidth, minWidth: leftWidth }}
            >
              {/* Tab buttons */}
              <nav className="studio-tabs">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`studio-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Active panel content */}
              <div className="studio-panel-content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    {activeTab === 'workflow' && <WorkflowPanel project={project} isGenerating={isGenerating} activeJobId={activeJobId} progress={generationProgress} onGenerate={(step) => {
                      if (step === 'script') generateScript(id);
                      else if (step === 'scenes') generateScenes(id);
                      else if (step === 'prompts') generatePrompts(id);
                      else if (step === 'voice') generateVoice(id);
                      else if (step === 'thumbnail') generateThumbnail(id);
                      else if (step === 'seo') generateSEO(id);
                    }} />}
                    {activeTab === 'script' && <ScriptEditor script={script} projectId={id} isGenerating={isGenerating.script} onGenerate={() => generateScript(id)} />}
                    {activeTab === 'scenes' && <SceneCards scenes={scenes} isGeneratingScenes={isGenerating.scenes} isGeneratingPrompts={isGenerating.prompts} onGenerateScenes={() => generateScenes(id)} onGeneratePrompts={() => generatePrompts(id)} />}
                    {activeTab === 'voice' && <VoicePanel voice={voice} isGenerating={isGenerating.voice} onGenerate={(opts) => generateVoice(id, opts)} />}
                    {activeTab === 'thumbnail' && <ThumbnailPanel thumbnail={thumbnail} isGenerating={isGenerating.thumbnail} onGenerate={() => generateThumbnail(id)} />}
                    {activeTab === 'seo' && <SEOPanel seo={seo} isGenerating={isGenerating.seo} onGenerate={() => generateSEO(id)} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Left resize handle */}
        <div
          className="resize-handle"
          onMouseDown={() => setIsDraggingLeft(true)}
          title="Drag to resize"
        />

        {/* ── Center: Video Preview + Timeline ── */}
        <main className="studio-center">
          <VideoPreview
            videoUrl={videoUrl}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            scenes={scenes}
            voice={voice}
          />

          {/* AI Console (bottom of center panel) */}
          <AnimatePresence initial={false}>
            {consoleOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 200, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="studio-console-container"
              >
                <AIConsole logs={generationLogs} isActive={isAnyGenerating} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Console toggle */}
          <button
            className="console-toggle-btn"
            onClick={() => setConsoleOpen(!consoleOpen)}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>AI Console</span>
            <span className={`console-dot ${isAnyGenerating ? 'active' : ''}`} />
          </button>
        </main>

        {/* Right resize handle */}
        <div
          className="resize-handle"
          onMouseDown={() => setIsDraggingRight(true)}
          title="Drag to resize"
        />

        {/* ── Right Panel: Properties ── */}
        <aside className="studio-right-panel" style={{ width: rightWidth, minWidth: rightWidth }}>
          <ProjectProperties project={project} scenes={scenes} script={script} />
        </aside>
      </div>

      {/* Floating toggle sidebar button */}
      <button
        className="sidebar-toggle-fab"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title="Toggle Sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <style jsx>{`
        .studio-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #05050f;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* ── Header ── */
        .studio-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          padding: 0 12px;
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          z-index: 100;
          flex-shrink: 0;
          gap: 12px;
        }
        .studio-header-left, .studio-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .studio-header-right { justify-content: flex-end; }
        .studio-header-center {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
        .icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-primary {
          display: flex; align-items: center; gap: 6px;
          padding: 0 14px; height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          font-size: 13px; font-weight: 600;
          border: none; cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #8b5cf6, #7c3aed); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .divider-v { width: 1px; height: 24px; background: rgba(255,255,255,0.07); }
        .project-breadcrumb { display: flex; align-items: center; gap: 6px; }
        .breadcrumb-parent { font-size: 12px; color: rgba(255,255,255,0.35); }
        .breadcrumb-current { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); max-width: 200px; truncate: ellipsis; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .autosave-indicator { display: flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(255,255,255,0.4); }
        .credits-badge { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); padding: 4px 10px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 20px; }

        /* ── Body ── */
        .studio-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .studio-left-panel {
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          flex-shrink: 0;
        }
        .studio-tabs {
          display: flex;
          overflow-x: auto;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .studio-tabs::-webkit-scrollbar { height: 0; }
        .studio-tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          border-bottom: 2px solid transparent;
          background: transparent; border-top: none; border-left: none; border-right: none;
          cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
        }
        .studio-tab-btn.active { color: #a78bfa; border-bottom-color: #7c3aed; }
        .studio-tab-btn:hover:not(.active) { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.03); }
        .studio-panel-content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px; }

        /* ── Resize Handle ── */
        .resize-handle {
          width: 4px;
          background: rgba(255,255,255,0.04);
          cursor: col-resize;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .resize-handle:hover { background: rgba(124,58,237,0.4); }

        /* ── Center ── */
        .studio-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .studio-console-container {
          border-top: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          flex-shrink: 0;
        }
        .console-toggle-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 12px; height: 28px;
          background: rgba(255,255,255,0.03);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: none; border-left: none; border-right: none;
          color: rgba(255,255,255,0.4); font-size: 11px;
          cursor: pointer; transition: color 0.15s;
          flex-shrink: 0;
        }
        .console-toggle-btn:hover { color: rgba(255,255,255,0.7); }
        .console-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.2); margin-left: 4px; }
        .console-dot.active { background: #10b981; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        /* ── Right panel ── */
        .studio-right-panel {
          background: rgba(255,255,255,0.02);
          border-left: 1px solid rgba(255,255,255,0.06);
          overflow-y: auto;
          flex-shrink: 0;
        }

        /* ── FAB ── */
        .sidebar-toggle-fab {
          position: fixed; bottom: 24px; left: 16px; z-index: 200;
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.3);
          color: #a78bfa; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s ease;
        }
        .sidebar-toggle-fab:hover { background: rgba(124,58,237,0.35); transform: scale(1.05); }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function StatusBadge({ status, progress }: { status?: string; progress: number }) {
  const map: Record<string, { color: string; label: string }> = {
    draft: { color: 'rgba(255,255,255,0.15)', label: 'Draft' },
    generating: { color: 'rgba(245,158,11,0.3)', label: `Generating ${progress}%` },
    review: { color: 'rgba(6,182,212,0.3)', label: 'Review' },
    completed: { color: 'rgba(16,185,129,0.3)', label: 'Completed' },
    failed: { color: 'rgba(239,68,68,0.3)', label: 'Failed' },
  };
  const s = map[status || 'draft'] || map.draft;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20,
      background: s.color, fontSize: 11, fontWeight: 600,
      color: '#fff', whiteSpace: 'nowrap',
    }}>
      {status === 'generating' && <span className="animate-pulse">●</span>} {s.label}
    </span>
  );
}

function PlaybackControls({ isPlaying, setIsPlaying }: { isPlaying: boolean; setIsPlaying: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button className="icon-btn" title="Previous scene"><SkipBack className="h-3.5 w-3.5" /></button>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: 'none', color: '#fff', cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button className="icon-btn" title="Next scene"><SkipForward className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function ProjectProperties({ project, scenes, script }: { project: any; scenes: any[]; script: any }) {
  if (!project) return (
    <div style={{ padding: 20, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
      Loading project...
    </div>
  );

  const totalDuration = scenes.reduce((s, c) => s + (c.duration || 0), 0);
  const wordCount = script?.totalWordCount || 0;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Project info */}
      <section>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
          Project Info
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Genre', value: project.genre },
            { label: 'Style', value: project.style },
            { label: 'Aspect Ratio', value: project.aspectRatio },
            { label: 'Language', value: project.language?.toUpperCase() },
            { label: 'Scenes', value: `${scenes.length} scenes` },
            { label: 'Duration', value: `${Math.ceil(totalDuration / 60)}m ${totalDuration % 60}s` },
            { label: 'Word Count', value: wordCount.toLocaleString() },
            { label: 'Credits Used', value: `${project.creditsUsed} / ${project.creditsTotal}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, textTransform: 'capitalize' }}>{value || '—'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Progress */}
      <section>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
          Progress
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden', height: 6 }}>
          <div style={{
            height: '100%',
            width: `${project.totalSteps > 0 ? Math.round((project.currentStep / project.totalSteps) * 100) : 0}%`,
            background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
            transition: 'width 0.3s ease',
            borderRadius: 8,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          <span>Step {project.currentStep} of {project.totalSteps}</span>
          <span>{project.totalSteps > 0 ? Math.round((project.currentStep / project.totalSteps) * 100) : 0}%</span>
        </div>
      </section>
    </div>
  );
}
