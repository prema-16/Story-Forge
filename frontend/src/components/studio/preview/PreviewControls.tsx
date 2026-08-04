'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Gauge,
  Crop,
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { Button } from '@/components/ui/button';

interface PreviewControlsProps {
  onToggleFullscreen: () => void;
  showSafeMargins: boolean;
  onToggleSafeMargins: () => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  onToggleFullscreen,
  showSafeMargins,
  onToggleSafeMargins,
}) => {
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    playbackSpeed,
    setPlaybackSpeed,
    totalDuration,
  } = useStudioStore();

  const [isMuted, setIsMuted] = useState(false);

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  const stepFrame = (frames: number) => {
    setCurrentTime(Math.max(0, currentTime + frames / 30));
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-white/10 text-xs">
      {/* Left: Timecode Display */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-500/20 px-2 py-1 rounded">
          {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
        </span>

        <button
          onClick={onToggleSafeMargins}
          className={`p-1.5 rounded transition-colors ${showSafeMargins ? 'bg-purple-500/20 text-purple-300' : 'text-white/40 hover:text-white'}`}
          title="Toggle Safe Margins Overlay"
        >
          <Crop className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Center: Playback Controls & Frame Stepping */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => stepFrame(-10)} title="Step Back 10 Frames">
          <SkipBack className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => stepFrame(-1)} title="Step Back 1 Frame (Left Arrow)">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 rounded-full p-0 flex items-center justify-center bg-purple-600 hover:bg-purple-500"
          title="Play / Pause (Space)"
        >
          {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
        </Button>

        <Button variant="ghost" size="sm" onClick={() => stepFrame(1)} title="Step Forward 1 Frame (Right Arrow)">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => stepFrame(10)} title="Step Forward 10 Frames">
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Right: Speed, Audio, Fullscreen */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5 text-white/40" />
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-slate-950 border border-white/10 text-white text-[11px] rounded px-1 py-0.5 outline-none"
          >
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="1.0">1.0x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>

        <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white">
          {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <button onClick={onToggleFullscreen} className="text-white/50 hover:text-white" title="Fullscreen">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
