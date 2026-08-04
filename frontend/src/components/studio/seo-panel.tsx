'use client';
import React from 'react';
import { TrendingUp, Sparkles, Copy, Tag, Hash, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SEOData } from '../../lib/api';
import toast from 'react-hot-toast';

interface SEOPanelProps {
  seo: SEOData | null;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const SEOPanel = ({ seo, onGenerate, isGenerating }: SEOPanelProps) => {
  if (!seo) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <TrendingUp className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white">Generate YouTube SEO Metadata</h3>
        <p className="text-xs text-white/50 max-w-md">
          Optimize your title, description chapters, tags, and search keywords for YouTube algorithm indexing.
        </p>
        <Button onClick={onGenerate} isLoading={isGenerating} leftIcon={<Sparkles className="h-4 w-4" />}>
          Generate SEO Metadata (2 Credits)
        </Button>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">YouTube SEO Package</h2>
          <p className="text-xs text-white/50">Engineered for search ranking and recommended feed discovery</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="completed">Score {seo.titleScore || 95}/100</Badge>
          <Button variant="secondary" size="sm" onClick={onGenerate} isLoading={isGenerating}>
            Regenerate
          </Button>
        </div>
      </div>

      {/* Title */}
      <Card glass className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-300">Optimized Title</span>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(seo.title, 'Title')}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-base font-bold text-white">{seo.title}</p>
      </Card>

      {/* Description */}
      <Card glass className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-300">Video Description & Timestamps</span>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(seo.description, 'Description')}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed">{seo.description}</p>
      </Card>

      {/* Tags */}
      <Card glass className="p-5 space-y-3">
        <span className="text-xs font-semibold text-purple-300">Search Tags ({seo.tags?.length || 0})</span>
        <div className="flex flex-wrap gap-1.5">
          {(seo.tags || ['space', 'science', 'astronomy', 'universe', 'documentary']).map((tag, idx) => (
            <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
              #{tag}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};
