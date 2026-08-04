'use client';

import React from 'react';
import { useStudioStore, AssetItem, TimelineClip } from '@/store/studioStore';
import { Star, Plus, Film, Image as ImageIcon, Music, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AssetGrid: React.FC = () => {
  const { assets, selectedCategory, searchQuery, toggleFavoriteAsset, addClipToTrack, tracks } = useStudioStore();

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.type === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInsertToTimeline = (asset: AssetItem) => {
    // Find matching track type
    const trackType = asset.type === 'image' ? 'video' : asset.type === 'audio' ? 'audio' : 'video';
    const targetTrack = tracks.find((t) => t.type === trackType) || tracks[0];

    if (!targetTrack) return;

    const newClip: TimelineClip = {
      id: `clip_${Date.now()}`,
      name: asset.name,
      type: asset.type === 'image' ? 'video' : (asset.type as any),
      startTime: 0,
      duration: asset.duration || 5,
      mediaUrl: asset.url,
      volume: asset.type === 'audio' ? 1.0 : undefined,
    };

    addClipToTrack(targetTrack.id, newClip);
    toast.success(`Inserted '${asset.name}' onto ${targetTrack.name}`);
  };

  const getAssetIcon = (type: AssetItem['type']) => {
    switch (type) {
      case 'video':
        return <Film className="h-3 w-3 text-purple-400" />;
      case 'image':
        return <ImageIcon className="h-3 w-3 text-cyan-400" />;
      case 'audio':
        return <Music className="h-3 w-3 text-emerald-400" />;
      default:
        return <Volume2 className="h-3 w-3 text-amber-400" />;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[350px] pr-1">
      {filteredAssets.map((asset) => (
        <div
          key={asset.id}
          className="group relative bg-slate-900 border border-white/10 hover:border-purple-500/40 rounded-lg p-2 flex flex-col justify-between select-none transition-all"
        >
          {/* Top Info Header */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 truncate">
              {getAssetIcon(asset.type)}
              <span className="text-[11px] font-semibold text-white/90 truncate">{asset.name}</span>
            </div>
            <button
              onClick={() => toggleFavoriteAsset(asset.id)}
              className={`text-xs ${asset.isFavorite ? 'text-amber-400' : 'text-white/20 hover:text-amber-400'}`}
            >
              <Star className="h-3 w-3 fill-current" />
            </button>
          </div>

          {/* Thumbnail / Media Preview Card */}
          <div className="my-1.5 h-16 bg-slate-950 rounded flex items-center justify-center overflow-hidden relative">
            {asset.thumbnailUrl ? (
              <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-white/30 font-mono">MEDIA</span>
            )}
            {asset.duration && (
              <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-white/80">
                {asset.duration}s
              </span>
            )}
          </div>

          {/* Quick Insert to Timeline Button */}
          <button
            onClick={() => handleInsertToTimeline(asset)}
            className="w-full py-1 bg-white/5 hover:bg-purple-600 text-white text-[10px] font-medium rounded flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add to Timeline
          </button>
        </div>
      ))}
    </div>
  );
};
