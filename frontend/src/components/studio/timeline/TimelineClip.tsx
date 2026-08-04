'use client';

import React, { useState } from 'react';
import { TimelineClip as IClip, useStudioStore } from '@/store/studioStore';
import { Scissors, Volume2, FastForward } from 'lucide-react';

interface TimelineClipProps {
  clip: IClip;
  trackId: string;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({ clip, trackId }) => {
  const { zoomScale, selectedClipId, setSelectedClip, updateClipPosition, splitClip, currentTime } = useStudioStore();
  const [isHovered, setIsHovered] = useState(false);

  const pixelsPerSecond = 50 * zoomScale;
  const leftPx = clip.startTime * pixelsPerSecond;
  const widthPx = clip.duration * pixelsPerSecond;
  const isSelected = selectedClipId === clip.id;

  const handleSplitAtPlayhead = (e: React.MouseEvent) => {
    e.stopPropagation();
    splitClip(clip.id, currentTime);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedClip(clip.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center justify-between text-xs select-none cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-purple-400 bg-purple-600/60 font-bold text-white z-20'
          : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
      }`}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
    >
      {/* Clip Name */}
      <span className="truncate pr-1 text-[11px] font-medium">{clip.name}</span>

      {/* Clip Badges & Split Action */}
      <div className="flex items-center gap-1">
        {clip.volume !== undefined && (
          <span className="text-[9px] text-emerald-400 flex items-center">
            <Volume2 className="h-2.5 w-2.5 mr-0.5" />
            {Math.round(clip.volume * 100)}%
          </span>
        )}

        {isHovered && (
          <button
            onClick={handleSplitAtPlayhead}
            title="Split Clip at Playhead (S)"
            className="p-1 rounded bg-black/40 hover:bg-purple-600 text-white"
          >
            <Scissors className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Resize Handle Right */}
      {isSelected && (
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-purple-400 cursor-ew-resize rounded-r-md" />
      )}
    </div>
  );
};
