'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { PreviewControls } from './PreviewControls';
import { SubtitleOverlay } from './SubtitleOverlay';

export const PreviewPlayer: React.FC = () => {
  const { videoUrl, isPlaying, setIsPlaying, currentTime, setCurrentTime, playbackSpeed } = useStudioStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showSafeMargins, setShowSafeMargins] = useState(false);

  // Sync video element time and play/pause state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleToggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-slate-950 border-r border-white/10 select-none">
      {/* Video Viewport Stage */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        <video
          ref={videoRef}
          src={videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
          onTimeUpdate={handleTimeUpdate}
          className="max-h-full max-w-full object-contain aspect-video shadow-2xl"
        />

        {/* Subtitle Caption Overlay */}
        <SubtitleOverlay />

        {/* Safe Margins Overlay (Action & Title Safe Lines) */}
        {showSafeMargins && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Action Safe 90% */}
            <div className="w-[90%] h-[90%] border border-dashed border-cyan-400/40 relative">
              <span className="absolute top-1 left-1 text-[9px] text-cyan-400/60 font-mono">ACTION SAFE (90%)</span>
              {/* Title Safe 80% */}
              <div className="absolute inset-[5%] border border-dashed border-amber-400/40">
                <span className="absolute top-1 left-1 text-[9px] text-amber-400/60 font-mono">TITLE SAFE (80%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <PreviewControls
        onToggleFullscreen={handleToggleFullscreen}
        showSafeMargins={showSafeMargins}
        onToggleSafeMargins={() => setShowSafeMargins(!showSafeMargins)}
      />
    </div>
  );
};
