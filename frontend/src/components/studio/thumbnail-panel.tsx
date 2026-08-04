'use client';
import React from 'react';
import { Image, Sparkles, Eye, Palette, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Thumbnail } from '../../lib/api';

interface ThumbnailPanelProps {
  thumbnail: Thumbnail | null;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ThumbnailPanel = ({ thumbnail, onGenerate, isGenerating }: ThumbnailPanelProps) => {
  return (
    <div className="h-full flex flex-col overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-xl font-bold text-white">YouTube Thumbnail Studio</h2>
        <p className="text-xs text-white/50">AI Thumbnail Designer optimized for maximum CTR (Click-Through Rate)</p>
      </div>

      {!thumbnail ? (
        <Card glass className="p-12 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
            <Image className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Generate High-CTR Thumbnail</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Analyze video script hooks and design high-contrast color palettes, bold text overlays, and cinematic visual compositions.
          </p>
          <Button onClick={onGenerate} isLoading={isGenerating} leftIcon={<Sparkles className="h-4 w-4" />}>
            Design Thumbnail Concept (8 Credits)
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock Visual Thumbnail Display */}
          <Card glass className="p-4 space-y-3">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-900 via-pink-900 to-black border border-white/10 flex flex-col justify-between p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <Badge variant="purple" className="relative z-10 w-max">
                High CTR Concept
              </Badge>
              <div className="relative z-10">
                <h2 className="text-xl font-extrabold text-amber-300 drop-shadow-lg uppercase tracking-wider">
                  {thumbnail.titleText || 'SECRET DISCOVERED'}
                </h2>
              </div>
            </div>

            <Button onClick={onGenerate} isLoading={isGenerating} variant="secondary" size="sm" className="w-full">
              Regenerate Variant
            </Button>
          </Card>

          {/* Breakdown & Hook Stats */}
          <div className="space-y-4">
            <Card glass className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/50">Est. Click-Through Score</span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                  <TrendingUp className="h-4 w-4" /> {thumbnail.clickThroughScore || 94}/100
                </div>
              </div>
              <p className="text-xs text-white/70">{thumbnail.composition || 'Close-up high tension facial expression with glowing purple background mesh.'}</p>
            </Card>

            <Card glass className="p-5 space-y-3">
              <span className="text-xs font-semibold text-white/50">Color Palette</span>
              <div className="flex items-center gap-2">
                {(thumbnail.colorPalette || ['#7c3aed', '#ec4899', '#f59e0b', '#06b6d4']).map((color, idx) => (
                  <div key={idx} className="h-8 flex-1 rounded-lg border border-white/10" style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
