'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clapperboard,
  Sparkles,
  Camera,
  Eye,
  Clock,
  Edit2,
  Trash2,
  Copy,
  Plus,
  Play,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Scene } from '../../lib/api';

interface SceneCardsProps {
  scenes: Scene[];
  onGenerateScenes: () => void;
  onGeneratePrompts: () => void;
  isGeneratingScenes: boolean;
  isGeneratingPrompts: boolean;
}

export const SceneCards = ({
  scenes,
  onGenerateScenes,
  onGeneratePrompts,
  isGeneratingScenes,
  isGeneratingPrompts,
}: SceneCardsProps) => {
  if (!scenes || scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Clapperboard className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Scenes Planned Yet</h3>
        <p className="text-xs text-white/50 max-w-md">
          Break your script into timed visual scenes with camera movements and lighting cues.
        </p>
        <Button onClick={onGenerateScenes} isLoading={isGeneratingScenes} leftIcon={<Sparkles className="h-4 w-4" />}>
          Generate Scene Breakdown
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#050512]">
      {/* Scenes Toolbar */}
      <div className="h-14 border-b border-white/[0.07] px-6 flex items-center justify-between bg-[#0a0a1f]/60 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="purple">{scenes.length} Scenes</Badge>
          <span className="text-xs text-white/40">
            Total Duration: {scenes.reduce((acc, s) => acc + (s.duration || 10), 0)}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGeneratePrompts}
            isLoading={isGeneratingPrompts}
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            Generate Visual Prompts
          </Button>
          <Button variant="secondary" size="sm" onClick={onGenerateScenes} isLoading={isGeneratingScenes}>
            Regenerate Scenes
          </Button>
        </div>
      </div>

      {/* Grid of Scene Cards */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene, idx) => (
          <motion.div
            key={scene._id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <Card hover glass className="h-full flex flex-col justify-between p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">Scene #{scene.sceneNumber || idx + 1}</span>
                  <Badge variant="default">{scene.duration || 10}s</Badge>
                </div>

                <h4 className="text-sm font-semibold text-white line-clamp-1">{scene.title}</h4>

                {/* Narration */}
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider block">Narration</span>
                  <p className="text-xs text-white/70 line-clamp-3">{scene.narration}</p>
                </div>

                {/* Visual Description */}
                <div className="bg-purple-500/[0.04] p-3 rounded-xl border border-purple-500/10 space-y-1">
                  <span className="text-[10px] font-medium text-purple-300 uppercase tracking-wider block">Visual Prompt</span>
                  <p className="text-xs text-purple-200/80 line-clamp-3">{scene.visualDescription}</p>
                </div>
              </div>

              {/* Camera & Tags Footer */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
                <div className="flex items-center gap-1.5 truncate">
                  <Camera className="h-3 w-3 text-purple-400" />
                  <span className="truncate">{scene.cameraMovement || 'Pan Right'}</span>
                </div>
                <span className="capitalize">{scene.mood || 'cinematic'}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
