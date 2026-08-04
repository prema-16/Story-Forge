'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/app-layout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { GENRES } from '../../lib/utils';
import { Sparkles, Search, ArrowRight, Video } from 'lucide-react';

const mockTemplates = [
  { id: '1', title: 'True Crime Mystery Breakdown', genre: 'crime', duration: '10m', style: 'Cinematic Dark', credits: 25 },
  { id: '2', title: 'Deep Space Cosmic Secrets', genre: 'space', duration: '8m', style: 'Documentary Ultra', credits: 20 },
  { id: '3', title: 'Ancient History Uncovered', genre: 'history', duration: '12m', style: 'Historical Realistic', credits: 30 },
  { id: '4', title: 'Tech Breakthrough Analysis', genre: 'technology', duration: '5m', style: 'Modern Minimalist', credits: 15 },
  { id: '5', title: 'Financial Freedom Playbook', genre: 'finance', duration: '7m', style: 'Infographic Motion', credits: 18 },
  { id: '6', title: 'Gaming Lore Deep Dive', genre: 'gaming', duration: '15m', style: 'Cyberpunk Animated', credits: 35 },
];

export default function TemplatesPage() {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockTemplates.filter((t) => {
    const matchesGenre = selectedGenre === 'all' || t.genre === selectedGenre;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <AppLayout title="Video Templates" subtitle="Pre-built AI Director workflows engineered for high YouTube engagement">
      <div className="space-y-6 pb-12">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === 'all' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              All Genres
            </button>
            {GENRES.slice(0, 6).map((g) => (
              <button
                key={g.value}
                onClick={() => setSelectedGenre(g.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === g.value ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <Input
            placeholder="Search templates..."
            leftIcon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full sm:w-60 text-xs"
          />
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <Card key={tpl.id} glass hover className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="purple">{tpl.genre}</Badge>
                  <span className="text-xs text-white/40">{tpl.duration} • ~{tpl.credits} pts</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{tpl.title}</h3>
                <p className="text-xs text-white/50">Style: {tpl.style}</p>
              </div>

              <Link href={`/projects/new?template=${tpl.id}`}>
                <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Use This Template
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
