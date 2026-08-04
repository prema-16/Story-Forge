'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';

export const SubtitleOverlay: React.FC = () => {
  const { currentTime, tracks } = useStudioStore();

  const subtitleTrack = tracks.find((t) => t.type === 'subtitle');
  if (!subtitleTrack || subtitleTrack.isMuted) return null;

  const currentSubtitleClip = subtitleTrack.clips.find(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  if (!currentSubtitleClip) return null;

  return (
    <div className="absolute bottom-8 left-12 right-12 flex justify-center pointer-events-none z-20">
      <div className="bg-black/80 backdrop-blur-sm border border-white/10 text-amber-300 font-bold font-sans text-sm md:text-base px-4 py-1.5 rounded-lg shadow-xl tracking-wide text-center max-w-xl">
        {currentSubtitleClip.name}
      </div>
    </div>
  );
};
