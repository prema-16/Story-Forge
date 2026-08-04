'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { useStudioStore, AssetItem } from '@/store/studioStore';
import toast from 'react-hot-toast';

export const AssetUploader: React.FC = () => {
  const { addAsset } = useStudioStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setTimeout(() => {
      const file = files[0];
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const type = isVideo ? 'video' : isAudio ? 'audio' : 'image';

      const newAsset: AssetItem = {
        id: `ast_${Date.now()}`,
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        duration: isVideo || isAudio ? 12 : undefined,
        tags: ['uploaded', type],
        thumbnailUrl: type === 'image' ? URL.createObjectURL(file) : undefined,
        isFavorite: false,
      };

      addAsset(newAsset);
      setIsUploading(false);
      toast.success(`Uploaded '${file.name}' to DAM library!`);
    }, 800);
  };

  return (
    <div className="relative border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-xl p-4 text-center transition-all bg-white/[0.02]">
      <input
        type="file"
        onChange={handleFileUpload}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        accept="video/*,audio/*,image/*"
      />
      <div className="flex flex-col items-center gap-1">
        <UploadCloud className="h-6 w-6 text-purple-400" />
        <span className="text-xs font-semibold text-white/80">
          {isUploading ? 'Uploading to Cloud Storage...' : 'Drag & drop media assets'}
        </span>
        <span className="text-[10px] text-white/40">MP4, MOV, WAV, MP3, PNG, JPG</span>
      </div>
    </div>
  );
};
