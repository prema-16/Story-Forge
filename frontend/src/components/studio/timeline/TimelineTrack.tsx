'use client';

import React from 'react';
import { TimelineTrack as ITrack, useStudioStore } from '@/store/studioStore';
import { TimelineClip } from './TimelineClip';
import { Lock, VolumeX, Eye, Video, Mic, Type, Wand2 } from 'lucide-react';

interface TimelineTrackProps {
  track: ITrack;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({ track }) => {
  const { toggleTrackLock, toggleTrackMute, zoomScale, totalDuration } = useStudioStore();

  const pixelsPerSecond = 50 * zoomScale;
  const totalWidthPixels = Math.max(1200, totalDuration * pixelsPerSecond);

  const getTrackIcon = () => {
    switch (track.type) {
      case 'video':
        return <Video className="h-3.5 w-3.5 text-purple-400" />;
      case 'audio':
        return <Mic className="h-3.5 w-3.5 text-emerald-400" />;
      case 'subtitle':
        return <Type className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Wand2 className="h-3.5 w-3.5 text-pink-400" />;
    }
  };

  return (
    <div className="flex h-12 border-b border-white/[0.06] bg-slate-900/40">
      {/* Track Left Controls Header */}
      <div className="w-48 shrink-0 border-r border-white/10 px-3 flex items-center justify-between bg-slate-900/90 z-10">
        <div className="flex items-center gap-2 truncate">
          {getTrackIcon()}
          <span className="text-xs font-semibold text-white/90 truncate">{track.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleTrackMute(track.id)}
            className={`p-1 rounded ${track.isMuted ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white'}`}
            title="Mute Track"
          >
            <VolumeX className="h-3 w-3" />
          </button>
          <button
            onClick={() => toggleTrackLock(track.id)}
            className={`p-1 rounded ${track.isLocked ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:text-white'}`}
            title="Lock Track"
          >
            <Lock className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Track Clips Container */}
      <div className="relative flex-1 overflow-hidden" style={{ width: `${totalWidthPixels}px` }}>
        {track.clips.map((clip) => (
          <TimelineClip key={clip.id} clip={clip} trackId={track.id} />
        ))}
      </div>
    </div>
  );
};
