'use client';

import React, { useRef } from 'react';
import { useStudioStore } from '@/store/studioStore';

export const TimelineRuler: React.FC = () => {
  const { currentTime, setCurrentTime, zoomScale, totalDuration, markers } = useStudioStore();
  const rulerRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = 50 * zoomScale;
  const totalWidthPixels = Math.max(1200, totalDuration * pixelsPerSecond);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = clickX / pixelsPerSecond;
    setCurrentTime(newTime);
  };

  // Generate tick marks every 1 second
  const renderTicks = () => {
    const ticks = [];
    const stepSeconds = zoomScale < 0.5 ? 5 : zoomScale > 1.5 ? 0.5 : 1;

    for (let sec = 0; sec <= totalDuration; sec += stepSeconds) {
      const x = sec * pixelsPerSecond;
      const isMajor = sec % 5 === 0;

      const mins = Math.floor(sec / 60);
      const secs = Math.floor(sec % 60);
      const frames = Math.floor((sec % 1) * 30);
      const timecode = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;

      ticks.push(
        <div key={sec} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${x}px` }}>
          {isMajor && (
            <span className="text-[10px] text-white/40 font-mono -top-4 absolute select-none pointer-events-none">
              {timecode}
            </span>
          )}
          <div className={`w-px ${isMajor ? 'h-3 bg-white/30' : 'h-1.5 bg-white/10'}`} />
        </div>
      );
    }
    return ticks;
  };

  return (
    <div
      ref={rulerRef}
      onClick={handleRulerClick}
      className="relative h-7 bg-slate-950 border-b border-white/10 select-none cursor-pointer overflow-hidden"
      style={{ width: `${totalWidthPixels}px` }}
    >
      {/* Ticks */}
      {renderTicks()}

      {/* Markers */}
      {markers.map((m) => (
        <div
          key={m.id}
          className="absolute top-0 bottom-0 w-0.5 bg-pink-500 z-10 pointer-events-none"
          style={{ left: `${m.time * pixelsPerSecond}px` }}
        >
          <span className="text-[9px] font-bold bg-pink-600 text-white px-1 rounded-b absolute -left-2 top-0">
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
};
