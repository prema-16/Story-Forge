'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStudioStore } from '@/store/studioStore';
import {
  Film,
  FolderOpen,
  Wand2,
  Sliders,
  History,
  Search,
  Download,
  Share2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimelineContainer } from '@/components/studio/timeline/TimelineContainer';
import { PreviewPlayer } from '@/components/studio/preview/PreviewPlayer';
import { AssetLibrary } from '@/components/studio/assets/AssetLibrary';
import { SceneInspector } from '@/components/studio/inspector/SceneInspector';
import { AIEditingPanel } from '@/components/studio/ai-tools/AIEditingPanel';
import { VersionHistoryModal } from '@/components/studio/versioning/VersionHistoryModal';
import { CommandPalette } from '@/components/studio/search/CommandPalette';
import { KeyboardShortcutsHandler } from '@/components/studio/shortcuts/KeyboardShortcutsHandler';

export default function StudioEditorPage() {
  const params = useParams();
  const projectId = (params?.id as string) || 'demo-proj-1';
  const { project, loadProject, isCommandPaletteOpen, setCommandPaletteOpen } = useStudioStore();

  const [leftTab, setLeftTab] = useState<'dam' | 'ai'>('dam');
  const [rightTab, setRightTab] = useState<'inspector' | 'copilot'>('inspector');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  useEffect(() => {
    loadProject(projectId);
  }, [projectId, loadProject]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans overflow-hidden select-none">
      {/* Keyboard Shortcuts Global Listener */}
      <KeyboardShortcutsHandler />

      {/* Command Palette Modal */}
      <CommandPalette />

      {/* Version History Modal */}
      <VersionHistoryModal isOpen={isVersionModalOpen} onClose={() => setIsVersionModalOpen(false)} />

      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <header className="h-12 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-purple-400" />
            <h1 className="text-sm font-bold truncate max-w-xs">{project?.title || 'StoryForge Studio'}</h1>
            <Badge variant="completed">NLE v3.0</Badge>
          </div>
        </div>

        {/* Center: Command Palette Trigger & Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1 bg-white/[0.04] hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/50 transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search or type command...</span>
            <kbd className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded font-mono text-white/60">⌘K</kbd>
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVersionModalOpen(true)}
            className="text-xs text-white/60 hover:text-white"
          >
            <History className="h-3.5 w-3.5 mr-1 text-purple-400" /> Snapshots
          </Button>
        </div>

        {/* Right: Export & Collaboration Avatars */}
        <div className="flex items-center gap-3">
          {/* Active Collaborator Avatars */}
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold">
              JD
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold">
              AI
            </div>
          </div>

          <Button variant="primary" size="sm" className="text-xs h-8 bg-purple-600 hover:bg-purple-500">
            <Download className="h-3.5 w-3.5 mr-1" /> Export Video
          </Button>
        </div>
      </header>

      {/* ── Main Studio Grid Workspace ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: DAM Asset Library & AI Tools */}
        <div className="w-80 shrink-0 flex flex-col border-r border-white/10 bg-slate-900/60">
          <div className="flex border-b border-white/10 text-xs font-semibold">
            <button
              onClick={() => setLeftTab('dam')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                leftTab === 'dam' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5" /> Assets (DAM)
            </button>
            <button
              onClick={() => setLeftTab('ai')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                leftTab === 'ai' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" /> AI Tools
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {leftTab === 'dam' ? <AssetLibrary /> : <AIEditingPanel />}
          </div>
        </div>

        {/* Center Panel: Video Preview Player */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewPlayer />
        </div>

        {/* Right Panel: Scene Inspector & Properties */}
        <div className="w-80 shrink-0 flex flex-col border-l border-white/10 bg-slate-900/60">
          <div className="flex border-b border-white/10 text-xs font-semibold">
            <button
              onClick={() => setRightTab('inspector')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                rightTab === 'inspector' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" /> Inspector
            </button>
            <button
              onClick={() => setRightTab('copilot')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                rightTab === 'copilot' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Suggestions
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {rightTab === 'inspector' ? <SceneInspector /> : <AIEditingPanel />}
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Non-Linear Multi-Track Timeline Engine ───────────── */}
      <div className="h-72 shrink-0 border-t border-white/10">
        <TimelineContainer />
      </div>
    </div>
  );
}
