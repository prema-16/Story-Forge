'use client';

import React, { useState } from 'react';
import {
  Server,
  Share2,
  HardDrive,
  Clock,
  Activity,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  FileVideo,
  Database,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function ProductionHubPage() {
  const [activeTab, setActiveTab] = useState<'workers' | 'publishing' | 'encoding' | 'storage' | 'automation'>('workers');

  const workers = [
    { id: 'worker-gpu-01', host: 'node-gpu-east.storyforge.ai', type: 'GPU (RTX 4090)', jobs: '1/4', cpu: '35%', mem: '42%', status: 'Healthy' },
    { id: 'worker-cpu-01', host: 'node-cpu-central.storyforge.ai', type: 'CPU (32 Cores)', jobs: '2/8', cpu: '68%', mem: '55%', status: 'Healthy' },
    { id: 'worker-gpu-02', host: 'node-gpu-west.storyforge.ai', type: 'GPU (A100 80GB)', jobs: '0/8', cpu: '12%', mem: '18%', status: 'Healthy' },
  ];

  const publishChannels = [
    { name: 'YouTube (StoryForge Channel)', handle: '@storyforgeai', status: 'Connected', platform: 'YouTube' },
    { name: 'TikTok Creator Hub', handle: '@storyforge_tiktok', status: 'Connected', platform: 'TikTok' },
    { name: 'Instagram Reels', handle: '@storyforge.ai', status: 'Connected', platform: 'Instagram' },
    { name: 'X / Twitter Official', handle: '@StoryForgeAI', status: 'Connected', platform: 'X' },
  ];

  const storageBuckets = [
    { name: 'AWS S3 (us-east-1)', provider: 'S3', usage: '1.2 TB / 5 TB', cdn: 'CloudFront', status: 'Active' },
    { name: 'Cloudflare R2 (Global)', provider: 'R2', usage: '840 GB / 2 TB', cdn: 'Cloudflare Edge', status: 'Active' },
    { name: 'Cloudinary Asset Vault', provider: 'Cloudinary', usage: '450 GB', cdn: 'Fastly', status: 'Active' },
  ];

  const triggerPublish = (platform: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: `Publishing video to ${platform}...`,
        success: `Video published to ${platform}!`,
        error: 'Publishing failed',
      }
    );
  };

  return (
    <AppLayout title="Production Hub" subtitle="Distributed Render Farm, Transcoding Pipeline & Multi-Platform Social Publishing Platform">
      <div className="space-y-8 max-w-6xl">
        {/* Top Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] gap-6 text-sm font-medium">
          {[
            { id: 'workers', label: 'Render Farm Workers', icon: Server },
            { id: 'publishing', label: 'Social Publishing Center', icon: Share2 },
            { id: 'encoding', label: 'Multi-Format Encoding', icon: FileVideo },
            { id: 'storage', label: 'Storage & CDN Manager', icon: HardDrive },
            { id: 'automation', label: 'Automation & Webhooks', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400 font-bold'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Render Farm Workers */}
        {activeTab === 'workers' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Server className="h-4 w-4 text-purple-400" /> Active Render Farm Worker Nodes
              </span>
              <Badge variant="running">3 Nodes Active</Badge>
            </CardTitle>
            <CardDescription>BullMQ distributed render cluster with CPU/GPU load balancing</CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {workers.map((w) => (
                <div key={w.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{w.id}</h4>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      {w.status}
                    </span>
                  </div>
                  <div className="text-xs text-white/50 space-y-1 font-mono">
                    <p>Type: <span className="text-purple-300">{w.type}</span></p>
                    <p>Active Jobs: <span className="text-white">{w.jobs}</span></p>
                    <p>CPU Load: <span className="text-white">{w.cpu}</span> | RAM: <span className="text-white">{w.mem}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 2: Social Publishing Center */}
        {activeTab === 'publishing' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-purple-400" /> Multi-Platform Publishing Channels
              </span>
              <Button size="sm" variant="primary" onClick={() => triggerPublish('YouTube & TikTok')}>
                <Play className="h-3.5 w-3.5 mr-1" /> Publish Latest Render
              </Button>
            </CardTitle>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {publishChannels.map((c) => (
                <div key={c.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    <p className="text-xs text-white/40 font-mono">{c.handle}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => triggerPublish(c.platform)}>
                    Publish
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 3: Multi-Format Encoding */}
        {activeTab === 'encoding' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileVideo className="h-4 w-4 text-purple-400" /> Multi-Format Transcoding Engine & Presets
            </CardTitle>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {['MP4 (H.264)', 'H.265 / HEVC', 'WebM VP9', 'MOV ProRes', 'Animated GIF', 'PNG Sequence', 'MP3 Audio', 'SRT Subtitles'].map((fmt) => (
                <div key={fmt} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center space-y-1">
                  <span className="text-xs font-bold text-white">{fmt}</span>
                  <p className="text-[10px] text-emerald-400 font-mono">Standard Preset</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 4: Storage & CDN Manager */}
        {activeTab === 'storage' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-400" /> Storage Buckets & CDN Distribution
            </CardTitle>

            <div className="space-y-3 pt-2">
              {storageBuckets.map((s) => (
                <div key={s.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{s.name}</h4>
                    <p className="text-xs text-white/40 font-mono">CDN: {s.cdn} | Usage: {s.usage}</p>
                  </div>
                  <Badge variant="completed">{s.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 5: Automation */}
        {activeTab === 'automation' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" /> Automation Rules & Webhook Events
            </CardTitle>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-purple-300 space-y-2">
              <p>[Rule 1]: Cron <span className="text-emerald-400">0 2 * * *</span> ➔ Auto Backup Database to AWS S3</p>
              <p>[Rule 2]: Event <span className="text-emerald-400">render_complete</span> ➔ Auto Publish to YouTube Shorts</p>
              <p>[Rule 3]: Webhook <span className="text-emerald-400">https://api.storyforge.ai/webhooks/render</span> ➔ Dispatch Slack Notification</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
