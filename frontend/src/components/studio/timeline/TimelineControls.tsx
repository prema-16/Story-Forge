'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Magnet,
  Lock,
  Plus,
  Bookmark,
  Layers,
  Scissors,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const TimelineControls: React.FC = () => {
  const {
    zoomScale,
    setZoomScale,
    isSnapEnabled,
    toggleSnap,
    isMagneticTimeline,
    toggleMagnetic,
    addTrack,
    addMarker,
    currentTime,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useStudioStore();

  const handleAddMarker = () => {
    addMarker(currentTime, `Marker at ${currentTime.toFixed(1)}s`);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-white/[0.08] text-xs">
      {/* Left: Quick Editing Tools */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Cmd+Z)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Cmd+Shift+Z)"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSnap}
          className={isSnapEnabled ? 'text-purple-400 bg-purple-500/10' : 'text-white/50'}
          title="Toggle Magnetic Snap"
        >
          <Magnet className="h-3.5 w-3.5 mr-1" /> Snap
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMagnetic}
          className={isMagneticTimeline ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/50'}
          title="Toggle Magnetic Ripple"
        >
          <Layers className="h-3.5 w-3.5 mr-1" /> Magnetic
        </Button>

        <Button variant="ghost" size="sm" onClick={handleAddMarker} title="Add Marker at Playhead (M)">
          <Bookmark className="h-3.5 w-3.5 mr-1 text-pink-400" /> Marker
        </Button>
      </div>

      {/* Right: Zoom Scale & Add Track */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-white/50">
          <ZoomOut className="h-3.5 w-3.5 cursor-pointer hover:text-white" onClick={() => setZoomScale(zoomScale - 0.2)} />
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={zoomScale}
            onChange={(e) => setZoomScale(parseFloat(e.target.value))}
            className="w-20 accent-purple-500 h-1 bg-white/10 rounded"
          />
          <ZoomIn className="h-3.5 w-3.5 cursor-pointer hover:text-white" onClick={() => setZoomScale(zoomScale + 0.2)} />
        </div>

        <div className="h-4 w-px bg-white/10" />

        <Button
          variant="secondary"
          size="sm"
          onClick={() => addTrack('video', 'New Video Track')}
          className="text-xs py-1 h-7"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Track
        </Button>
      </div>
    </div>
  );
};
