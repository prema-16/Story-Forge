'use client';
import React, { useRef, useEffect, useState } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  SkipBack, SkipForward, Subtitles, Settings2,
} from 'lucide-react';
import { Scene, Voice } from '../../lib/api';

interface VideoPreviewProps {
  videoUrl: string | null;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  currentTime: number;
  setCurrentTime: (t: number) => void;
  scenes: Scene[];
  voice?: Voice | null;
}

export function VideoPreview({
  videoUrl, isPlaying, setIsPlaying, currentTime, setCurrentTime, scenes, voice
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSceneDuration = scenes.reduce((s, c) => s + (c.duration || 0), 0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    video.load();
    if (isPlaying) video.play().catch(() => {});
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.play().catch(() => {});
    else video.pause();
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * (duration || totalSceneDuration);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-preview-container" ref={containerRef}>
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            className="video-element"
            src={videoUrl}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Subtitle overlay */}
          {showSubtitles && <SubtitleOverlay currentTime={currentTime} scenes={scenes} />}

          {/* Gradient overlay for controls */}
          <div className="video-gradient-overlay" />

          {/* Controls */}
          <div className="video-controls">
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="video-progress-bar"
              onClick={handleProgressClick}
            >
              <div className="progress-track">
                {/* Scene markers */}
                {scenes.map((scene, i) => {
                  const sceneStart = scenes.slice(0, i).reduce((s, c) => s + c.duration, 0);
                  const left = (sceneStart / totalSceneDuration) * 100;
                  return (
                    <div
                      key={scene._id}
                      className="scene-marker"
                      style={{ left: `${left}%` }}
                      title={scene.title}
                    />
                  );
                })}
                <div className="progress-fill" style={{ width: `${pct}%` }} />
                <div className="progress-thumb" style={{ left: `${pct}%` }} />
              </div>
            </div>

            {/* Control buttons */}
            <div className="controls-row">
              <div className="controls-left">
                <button className="ctrl-btn" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration || totalSceneDuration)}
                </span>
                <div className="volume-control">
                  <button className="ctrl-btn" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => { setVolume(+e.target.value); setIsMuted(false); }}
                    className="volume-slider"
                  />
                </div>
              </div>
              <div className="controls-right">
                <button className="ctrl-btn" onClick={() => setShowSubtitles(!showSubtitles)} title="Toggle subtitles">
                  <Subtitles className="h-3.5 w-3.5" style={{ color: showSubtitles ? '#a78bfa' : 'rgba(255,255,255,0.5)' }} />
                </button>
                <button className="ctrl-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <VideoPlaceholder scenes={scenes} />
      )}

      <style jsx>{`
        .video-preview-container {
          flex: 1;
          position: relative;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          min-height: 0;
        }
        .video-element {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .video-gradient-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 100px;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
          pointer-events: none;
        }
        .video-controls {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .video-progress-bar {
          cursor: pointer;
          padding: 6px 0;
        }
        .progress-track {
          position: relative;
          height: 3px;
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
          overflow: visible;
        }
        .progress-fill {
          position: absolute;
          left: 0; top: 0; height: 100%;
          background: linear-gradient(90deg, #7c3aed, #ec4899);
          border-radius: 2px;
          transition: width 0.1s linear;
        }
        .progress-thumb {
          position: absolute;
          top: 50%; transform: translate(-50%, -50%);
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 6px rgba(124,58,237,0.6);
          transition: left 0.1s linear;
        }
        .scene-marker {
          position: absolute;
          top: -2px; bottom: -2px;
          width: 2px;
          background: rgba(255,255,255,0.3);
          border-radius: 1px;
          z-index: 1;
        }
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .controls-left, .controls-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ctrl-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          border-radius: 6px;
          background: rgba(255,255,255,0.1);
          border: none; color: rgba(255,255,255,0.8);
          cursor: pointer; transition: background 0.15s;
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.2); }
        .time-display {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }
        .volume-control { display: flex; align-items: center; gap: 4px; }
        .volume-slider {
          width: 60px; height: 3px;
          -webkit-appearance: none;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function SubtitleOverlay({ currentTime, scenes }: { currentTime: number; scenes: Scene[] }) {
  let elapsed = 0;
  let currentScene: Scene | null = null;
  for (const scene of scenes) {
    if (currentTime >= elapsed && currentTime < elapsed + scene.duration) {
      currentScene = scene;
      break;
    }
    elapsed += scene.duration;
  }

  if (!currentScene) return null;

  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)', padding: '6px 16px', borderRadius: 8,
      fontSize: 14, color: '#fff', textAlign: 'center', maxWidth: '70%',
      textShadow: '0 1px 4px rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
    }}>
      {currentScene.narration?.slice(0, 80)}...
    </div>
  );
}

function VideoPlaceholder({ scenes }: { scenes: Scene[] }) {
  const totalDuration = scenes.reduce((s, c) => s + (c.duration || 0), 0);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 32,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))',
        border: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Play className="h-8 w-8 text-purple-400" />
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
          Video Preview
        </p>
        <p style={{ fontSize: 12 }}>
          Complete all generation steps then click <strong>Render Video</strong> to produce the final output.
        </p>
        {scenes.length > 0 && (
          <p style={{ fontSize: 11, marginTop: 8, color: 'rgba(255,255,255,0.2)' }}>
            {scenes.length} scenes · {Math.ceil(totalDuration / 60)}m {totalDuration % 60}s estimated
          </p>
        )}
      </div>
    </div>
  );
}
