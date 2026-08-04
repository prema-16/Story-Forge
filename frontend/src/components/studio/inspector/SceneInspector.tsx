'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';
import { Sliders, Camera, Clock, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const SceneInspector: React.FC = () => {
  const { scenes, selectedSceneId, selectedClipId, tracks } = useStudioStore();

  const selectedScene = scenes.find((s) => s._id === selectedSceneId) || scenes[0];

  const handleRegenerateScene = () => {
    toast.success('AI Scene regeneration requested!');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 p-3 gap-3 border-l border-white/10 select-none overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <Sliders className="h-4 w-4 text-purple-400" /> Inspector & Properties
        </h3>
      </div>

      {selectedScene ? (
        <div className="space-y-4 text-xs">
          {/* Scene Header Card */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{selectedScene.title}</span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                Scene #{selectedScene.order}
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">{selectedScene.narration}</p>
          </div>

          {/* Prompt & Camera Controls */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/50 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" /> Visual Image Prompt
            </label>
            <textarea
              defaultValue={selectedScene.description}
              className="w-full h-16 p-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Camera Motion</label>
              <select className="w-full bg-slate-950 border border-white/10 text-white text-xs rounded p-1.5 outline-none">
                <option>Slow Zoom In</option>
                <option>Pan Right</option>
                <option>Tilt Up</option>
                <option>Dolly Back</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-white/40 block mb-1">Transition</label>
              <select className="w-full bg-slate-950 border border-white/10 text-white text-xs rounded p-1.5 outline-none">
                <option>Cross Dissolve</option>
                <option>Fade to Black</option>
                <option>Wipe Left</option>
                <option>Zoom Burst</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerateScene}
            className="w-full text-xs py-1.5 h-8 flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate Visual
          </Button>
        </div>
      ) : (
        <div className="text-center py-8 text-white/40 text-xs">Select a scene or timeline clip to inspect properties.</div>
      )}
    </div>
  );
};
