'use client';
import React, { useState } from 'react';
import { Mic, Sparkles, Play, Pause, Volume2, Download, Check } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Voice } from '../../lib/api';
import toast from 'react-hot-toast';

interface VoicePanelProps {
  voice: Voice | null;
  onGenerate: (options?: { voiceId?: string; voiceName?: string }) => void;
  isGenerating: boolean;
}

const mockVoices = [
  { id: 'mock-rachel', name: 'Rachel (Professional Female)', provider: 'ElevenLabs' },
  { id: 'mock-adam', name: 'Adam (Deep Male Narrator)', provider: 'ElevenLabs' },
  { id: 'mock-antoni', name: 'Antoni (Documentary Tone)', provider: 'ElevenLabs' },
  { id: 'mock-bella', name: 'Bella (Calm Female Storyteller)', provider: 'ElevenLabs' },
];

export const VoicePanel = ({ voice, onGenerate, isGenerating }: VoicePanelProps) => {
  const [selectedVoice, setSelectedVoice] = useState(mockVoices[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-xl font-bold text-white">Voice Narration Studio</h2>
        <p className="text-xs text-white/50">Synthesize lifelike voiceovers using ElevenLabs and AI Voice Director</p>
      </div>

      {/* Voice Selector */}
      <Card glass className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Select AI Narrator</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mockVoices.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVoice(v)}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                selectedVoice.id === v.id
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-white">{v.name}</p>
                <p className="text-[10px] text-white/40">{v.provider}</p>
              </div>
              {selectedVoice.id === v.id && <Check className="h-4 w-4 text-purple-400" />}
            </button>
          ))}
        </div>

        <Button
          onClick={() => onGenerate({ voiceId: selectedVoice.id, voiceName: selectedVoice.name })}
          isLoading={isGenerating}
          leftIcon={<Sparkles className="h-4 w-4" />}
          className="w-full mt-2"
        >
          Synthesize Voice Narration (10 Credits)
        </Button>
      </Card>

      {/* Generated Audio Card */}
      {voice && (
        <Card glass className="p-6 space-y-4 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayToggle}
                className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 transition-all"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <div>
                <h4 className="text-sm font-bold text-white">{voice.voiceName || 'Rachel'}</h4>
                <p className="text-xs text-white/40">{voice.durationSeconds || 180}s • 44.1kHz AI Audio</p>
              </div>
            </div>
            <Badge variant="completed">Ready</Badge>
          </div>

          {/* Waveform Visualization Bars */}
          <div className="h-16 bg-white/[0.03] rounded-xl p-3 flex items-center justify-between gap-1 border border-white/[0.06]">
            {Array.from({ length: 48 }).map((_, i) => {
              const heightPct = Math.sin(i * 0.4) * 40 + 50;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-white/20'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
