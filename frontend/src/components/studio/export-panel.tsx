'use client';
import React, { useState } from 'react';
import { Download, Film, FileText, FileCode, Archive, Sparkles, Play, Pause, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useStudioStore } from '../../store/studioStore';
import toast from 'react-hot-toast';

interface ExportPanelProps {
  projectId: string;
}

const exportOptions = [
  { id: 'mp4', title: 'Rendered MP4 Video', desc: '1080p / 4K full merged video with voice & subtitles', icon: Film, size: '240 MB' },
  { id: 'zip', title: 'Complete Production ZIP Archive', desc: 'All raw clips, voice narration, thumbnail & scripts', icon: Archive, size: '380 MB' },
  { id: 'script', title: 'Script Document (.TXT)', desc: 'Full narrative script & scene breakdown', icon: FileText, size: '15 KB' },
  { id: 'srt', title: 'Subtitles & Captions (.SRT)', desc: 'Auto-synchronized SRT and VTT subtitle files', icon: FileCode, size: '8 KB' },
];

export const ExportPanel = ({ projectId }: ExportPanelProps) => {
  const { videoUrl, generateVideo, isGenerating } = useStudioStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = (type: string) => {
    toast.success(`Preparing ${type.toUpperCase()} package for download...`);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-xl font-bold text-white">AI Video Generation & Export</h2>
        <p className="text-xs text-white/50">Render video clips for all scenes, merge voice narration, and download export package</p>
      </div>

      {/* Video Player Render Card */}
      <Card glass className="p-6 space-y-4 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Rendered Video Output</h3>
          </div>
          <Badge variant={videoUrl ? 'completed' : 'pending'}>
            {videoUrl ? 'Render Complete' : 'Ready to Render'}
          </Badge>
        </div>

        {/* Video Player Box */}
        <div className="aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden relative group flex items-center justify-center">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Film className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-white">AI Video Clips Ready to Render</h4>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Click below to launch AI Video Director to generate 1080p video clips for each scene and apply transitions.
              </p>
              <Button
                onClick={() => generateVideo(projectId)}
                isLoading={!!isGenerating['video']}
                leftIcon={<Sparkles className="h-4 w-4" />}
                className="mt-2"
              >
                Render Full AI Video (30 Credits)
              </Button>
            </div>
          )}
        </div>

        {videoUrl && (
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateVideo(projectId)}
              isLoading={!!isGenerating['video']}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Re-render Video Clips
            </Button>
          </div>
        )}
      </Card>

      {/* Package Downloads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exportOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Card key={opt.id} glass hover className="p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="default">{opt.size}</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{opt.title}</h4>
                  <p className="text-xs text-white/50">{opt.desc}</p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={() => handleDownload(opt.id)}
              >
                Download {opt.id.toUpperCase()}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
