'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';
import { TimelineControls } from './TimelineControls';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTrack } from './TimelineTrack';

export const TimelineContainer: React.FC = () => {
  const { tracks, currentTime, zoomScale, totalDuration } = useStudioStore();

  const pixelsPerSecond = 50 * zoomScale;
  const playheadLeftPx = currentTime * pixelsPerSecond;

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t border-white/10 select-none overflow-hidden">
      {/* Timeline Controls Bar */}
      <TimelineControls />

      {/* Main Track Grid Area */}
      <div className="flex-1 overflow-auto relative">
        {/* Track Headers & Tracks */}
        <div className="relative min-w-full">
          {/* Ruler Line Header */}
          <div className="flex border-b border-white/10 sticky top-0 z-20 bg-slate-950">
            <div className="w-48 shrink-0 border-r border-white/10 px-3 py-1 bg-slate-900 font-mono text-[10px] text-white/40 flex items-center">
              TRACKS
            </div>
            <div className="flex-1 overflow-hidden">
              <TimelineRuler />
            </div>
          </div>

          {/* Interactive Playhead Needle */}
          <div
            className="absolute top-7 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
            style={{ left: `${192 + playheadLeftPx}px` }} // 192px = 12rem track header width
          >
            <div className="w-3 h-3 bg-red-500 rotate-45 -ml-1.25 -mt-1.5 rounded-sm" />
          </div>

          {/* Track Rows */}
          {tracks.map((track) => (
            <TimelineTrack key={track.id} track={track} />
          ))}
        </div>
      </div>
    </div>
  );
};
