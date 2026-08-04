'use client';

import React, { useState } from 'react';
import {
  ShoppingBag, Star, Download, Sparkles, Filter, Tag,
  DollarSign, ShieldCheck, Palette, Cpu, Music, Mic, Layers, ArrowUpRight
} from 'lucide-react';
import { AppLayout } from '../../components/layout/app-layout';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Items', icon: ShoppingBag },
    { id: 'templates', label: 'Video Templates', icon: Layers },
    { id: 'agents', label: 'AI Agent Swarms', icon: Cpu },
    { id: 'luts', label: 'Color LUTs', icon: Palette },
    { id: 'voices', label: 'Voice Packs', icon: Mic },
    { id: 'music', label: 'Music Packs', icon: Music },
  ];

  const items = [
    {
      id: 'mkt_101',
      title: 'Hollywood Sci-Fi 4K LUT Pack',
      creator: 'Alex Rivers (Cinematographer)',
      category: 'Color LUTs',
      price: '₹499',
      rating: 4.9,
      downloads: '1.4k',
      badge: 'Bestseller',
      gradient: 'from-purple-600/20 to-pink-600/10',
    },
    {
      id: 'mkt_102',
      title: '30-Sec TikTok Virality Agent Swarm',
      creator: 'Sarah K. (Shorts Studio)',
      category: 'AI Agent Swarms',
      price: '₹799',
      rating: 5.0,
      downloads: '2.8k',
      badge: 'Top Rated',
      gradient: 'from-amber-600/20 to-purple-600/10',
    },
    {
      id: 'mkt_103',
      title: 'Cyberpunk Neon Visual Transitions Pack',
      creator: 'VFX Motion Lab',
      category: 'Video Templates',
      price: '₹399',
      rating: 4.8,
      downloads: '940',
      badge: 'Trending',
      gradient: 'from-cyan-600/20 to-blue-600/10',
    },
    {
      id: 'mkt_104',
      title: 'Cinematic Voice Clone Bundle (50 Voices)',
      creator: 'AudioForge Pro',
      category: 'Voice Packs',
      price: '₹1,299',
      rating: 4.9,
      downloads: '3.1k',
      badge: 'Featured',
      gradient: 'from-emerald-600/20 to-teal-600/10',
    },
  ];

  return (
    <AppLayout title="AI Creator Marketplace" subtitle="Monetize and discover community video templates, LUTs, voice packs, and agent swarms">
      <div className="space-y-6 max-w-6xl">
        {/* Creator Revenue Share Banner */}
        <Card glass className="p-6 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900/40 border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" /> Creators Earn 70% Revenue Share
            </h3>
            <p className="text-xs text-purple-200/80 max-w-xl">
              Publish your custom LUTs, prompt packs, voice clones, and video templates to thousands of creators worldwide. Automated Razorpay & PayPal payouts.
            </p>
          </div>
          <Button variant="primary" onClick={() => toast.success('Creator Submission Portal Opened')}>
            Publish an Asset
          </Button>
        </Card>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} glass className="p-4 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all group">
              <div className="space-y-3">
                <div className={`h-32 rounded-xl bg-gradient-to-br ${item.gradient} border border-white/10 p-3 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-purple-300 border border-purple-500/30 font-medium">
                      {item.category}
                    </span>
                    <Badge variant="completed">{item.badge}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> {item.rating}</span>
                    <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5 text-white/50" /> {item.downloads}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-white/50">{item.creator}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-lg font-bold text-white font-mono">{item.price}</span>
                <Button size="sm" variant="secondary" onClick={() => toast.success(`Acquired ${item.title}`)}>
                  Acquire Asset
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
