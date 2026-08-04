'use client';
import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/app-layout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { BookOpen, Search, Copy, Star, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const mockPrompts = [
  { id: '1', title: 'Cinematic Noir Detective Office', genre: 'Crime', prompt: 'Cinematic wide shot, 1940s detective office, dim warm lamplight filtering through Venetian blinds, dense smoke, moody shadows, 35mm film grain, photorealistic, 8k --ar 16:9', usage: 1420 },
  { id: '2', title: 'Deep Space Nebula Flythrough', genre: 'Space', prompt: 'Ultra detailed cosmic nebula with vibrant violet and cyan gas clouds, distant glowing stars, cinematic camera dolly forward, photorealistic, Unreal Engine 5 render --ar 16:9', usage: 2310 },
  { id: '3', title: 'Cyberpunk Neon Alleyway', genre: 'Gaming', prompt: 'Rainy cyberpunk alley in Tokyo at night, glowing neon signs in magenta and cyan reflecting on wet asphalt, volumetric fog, dramatic lighting --ar 16:9', usage: 3100 },
  { id: '4', title: 'Ancient Roman Forum Sunset', genre: 'History', prompt: 'Majestic ancient Roman Forum at golden hour, towering marble pillars, warm sunset glow, historical realism, 8k resolution, cinematic lighting --ar 16:9', usage: 890 },
];

export default function PromptLibraryPage() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mockPrompts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.genre.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout title="Prompt Library" subtitle="Curated cinematic prompts for AI Prompt Engineer agent">
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search prompts by genre or style..."
            leftIcon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full sm:w-80"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} glass className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple">{p.genre}</Badge>
                  <span className="text-xs text-white/40">{p.usage} uses</span>
                </div>
                <h3 className="text-sm font-bold text-white">{p.title}</h3>
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] font-mono text-xs text-purple-200/80 leading-relaxed">
                  {p.prompt}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => handleCopy(p.id, p.prompt)}
                leftIcon={copiedId === p.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              >
                {copiedId === p.id ? 'Copied' : 'Copy Prompt'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
