'use client';

import React, { useState, useEffect } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { Search, Film, Music, Bookmark, Sparkles, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, assets, markers, scenes, setCurrentTime, setSelectedScene } = useStudioStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const results = [
    ...scenes.filter((s) => s.title.toLowerCase().includes(query.toLowerCase())).map((s) => ({ type: 'scene', label: `Scene: ${s.title}`, action: () => setSelectedScene(s._id) })),
    ...markers.filter((m) => m.label.toLowerCase().includes(query.toLowerCase())).map((m) => ({ type: 'marker', label: `Marker: ${m.label}`, action: () => setCurrentTime(m.time) })),
    ...assets.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())).map((a) => ({ type: 'asset', label: `Asset: ${a.name}`, action: () => {} })),
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-white/10 flex items-center gap-3">
          <Search className="h-5 w-5 text-purple-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search scenes, assets, markers... (Esc to close)"
            className="flex-1 bg-transparent text-sm text-white outline-none"
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {results.length > 0 ? (
            results.map((res, i) => (
              <div
                key={i}
                onClick={() => {
                  res.action();
                  setCommandPaletteOpen(false);
                }}
                className="p-2.5 rounded-lg hover:bg-purple-600/20 text-xs font-semibold text-white/90 cursor-pointer flex items-center justify-between transition-colors"
              >
                <span>{res.label}</span>
                <span className="text-[10px] text-white/40 uppercase font-mono">{res.type}</span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-white/40">No matching studio items found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
