'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';
import { AssetUploader } from './AssetUploader';
import { AssetGrid } from './AssetGrid';
import { Search, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const AssetLibrary: React.FC = () => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStudioStore();

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'video', label: 'Videos' },
    { id: 'image', label: 'Images' },
    { id: 'audio', label: 'Audio' },
    { id: 'brand', label: 'Brand' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/60 p-3 gap-3 border-r border-white/10 select-none">
      {/* Header & Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
            <FolderOpen className="h-4 w-4 text-purple-400" /> Digital Asset Library (DAM)
          </h3>
        </div>

        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, images, audio, tags..."
            className="pl-8 text-xs h-8 bg-slate-950 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              selectedCategory === c.id
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <AssetUploader />

      {/* Asset Grid */}
      <div className="flex-1 overflow-hidden">
        <AssetGrid />
      </div>
    </div>
  );
};
