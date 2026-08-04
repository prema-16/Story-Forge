'use client';
import React, { useState } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, Volume2, Film, Type, Music } from 'lucide-react';
import { Scene } from '../../lib/api';

interface TimelineProps {
  scenes: Scene[];
}

export const Timeline = ({ scenes }: TimelineProps) => {
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSeconds = scenes.reduce((acc, s) => acc + (s.duration || 10), 0) || 60;

  return (
    <div className="h-44 border-t border-white/[0.07] bg-[#070718] flex flex-col flex-shrink-0 select-none overflow-hidden">
      {/* Timeline Controls Header */}
      <div className="h-9 px-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0a0a20]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4 text-purple-400" /> : <Play className="h-4 w-4" />}
          </button>
          <span className="text-xs font-mono text-purple-400">00:00:00 / {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}</span>

          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto-Saved
          </span>

          <span className="text-[10px] text-purple-300 font-medium bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1.5">
            <span className="flex -space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-500 text-[8px] text-white flex items-center justify-center font-bold">R</span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold">P</span>
            </span>
            👥 2 Live Editors
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            ⚡ Magnetic Snap: ON
          </button>

          <button
            type="button"
            className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            📈 Bezier Curve Graph
          </button>

          <button
            type="button"
            className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            🎯 AI Motion Track
          </button>

          <select
            className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white/80 outline-none"
            defaultValue="cinematic"
          >
            <option value="cinematic" className="bg-slate-900">LUT: Cinematic 4K</option>
            <option value="cyberpunk" className="bg-slate-900">LUT: Cyberpunk Neon</option>
            <option value="noir" className="bg-slate-900">LUT: Film Noir</option>
            <option value="vintage" className="bg-slate-900">LUT: Vintage 35mm</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              className="p-1 rounded text-white/40 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] text-white/40 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
              className="p-1 rounded text-white/40 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Track Content */}
      <div className="flex-1 overflow-x-auto p-2 space-y-1.5">
        {/* Track 1: Video Scenes */}
        <div className="flex items-center gap-2">
          <div className="w-20 text-[10px] font-semibold text-purple-300 flex items-center gap-1 flex-shrink-0">
            <Film className="h-3 w-3" /> Video
          </div>
          <div className="flex-1 flex gap-1 overflow-hidden" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
            {scenes.length === 0 ? (
              <div className="h-7 flex-1 rounded bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-[10px] text-white/30">
                No scenes
              </div>
            ) : (
              scenes.map((scene, idx) => (
                <div
                  key={scene._id || idx}
                  className="h-7 px-2 rounded bg-purple-600/30 border border-purple-500/40 flex items-center justify-between text-[10px] text-purple-200 truncate flex-shrink-0 min-w-[80px]"
                  style={{ width: `${(scene.duration || 10) * 12}px` }}
                >
                  <span className="truncate">#{scene.sceneNumber || idx + 1} {scene.title}</span>
                  <span className="text-[9px] opacity-60">{scene.duration || 10}s</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Track 2: Voice Audio */}
        <div className="flex items-center gap-2">
          <div className="w-20 text-[10px] font-semibold text-emerald-300 flex items-center gap-1 flex-shrink-0">
            <Volume2 className="h-3 w-3" /> Voice
          </div>
          <div className="flex-1" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
            <div className="h-7 w-full rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center px-3 text-[10px] text-emerald-200">
              ElevenLabs Narration Audio Track
            </div>
          </div>
        </div>

        {/* Track 3: Subtitles */}
        <div className="flex items-center gap-2">
          <div className="w-20 text-[10px] font-semibold text-amber-300 flex items-center gap-1 flex-shrink-0">
            <Type className="h-3 w-3" /> Subtitles
          </div>
          <div className="flex-1" style={{ transform: `scaleX(${zoom})`, transformOrigin: 'left' }}>
            <div className="h-7 w-full rounded bg-amber-500/20 border border-amber-500/30 flex items-center px-3 text-[10px] text-amber-200">
              Auto Sync Subtitle Track (.SRT)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
