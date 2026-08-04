'use client';

import React from 'react';
import { Sparkles, Wand2, Scissors, Music, Video, RefreshCw, VolumeX, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const AIEditingPanel: React.FC = () => {
  const triggerAIOperation = (name: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: `AI Copilot executing '${name}'...`,
        success: `AI Operation '${name}' applied!`,
        error: 'AI operation failed',
      }
    );
  };

  const tools = [
    { name: 'Extend Scene', icon: Wand2, desc: 'Generates 5s AI continuation' },
    { name: 'Shorten Scene', icon: Scissors, desc: 'Trims fluff & dead air' },
    { name: 'Rewrite Narration', icon: Sparkles, desc: 'Improves retention hooks' },
    { name: 'B-Roll Suggestions', icon: Video, desc: 'AI recommends visual clips' },
    { name: 'Replace Background Music', icon: Music, desc: 'Auto-selects matching BGM' },
    { name: 'Auto Silence Removal', icon: VolumeX, desc: 'Cuts audio gaps > 0.5s' },
    { name: 'Auto Subtitle Sync', icon: Type, desc: 'Aligns SRT to voice timestamps' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/60 p-3 gap-3 border-l border-white/10 select-none overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <Wand2 className="h-4 w-4 text-purple-400" /> AI Editing Copilot
        </h3>
      </div>

      <div className="space-y-2">
        {tools.map((t) => (
          <div
            key={t.name}
            onClick={() => triggerAIOperation(t.name)}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-purple-600/10 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <t.icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">{t.name}</h4>
              <p className="text-[10px] text-white/40">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
