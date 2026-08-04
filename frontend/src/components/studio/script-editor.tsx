'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Save,
  Edit3,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Script } from '../../lib/api';
import toast from 'react-hot-toast';

interface ScriptEditorProps {
  script: Script | null;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ScriptEditor = ({ script, onGenerate, isGenerating }: ScriptEditorProps) => {
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState(script?.title || '');
  const [introduction, setIntroduction] = useState(script?.introduction || '');
  const [ending, setEnding] = useState(script?.ending || '');

  useEffect(() => {
    if (script) {
      setTitle(script.title || '');
      setIntroduction(script.introduction || '');
      setEnding(script.ending || '');
    }
  }, [script]);

  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Script Generated Yet</h3>
        <p className="text-xs text-white/50 max-w-md">
          Click below to let AIWriter craft a complete narrative script based on your topic.
        </p>
        <Button onClick={onGenerate} isLoading={isGenerating} leftIcon={<Sparkles className="h-4 w-4" />}>
          Generate Script with AIWriter
        </Button>
      </div>
    );
  }

  const handleCopy = () => {
    const fullText = `${title}\n\n${introduction}\n\n${script.chapters.map((c) => c.content).join('\n\n')}\n\n${ending}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    toast.success('Script updated!');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#050512]">
      {/* Script Toolbar */}
      <div className="h-14 border-b border-white/[0.07] px-6 flex items-center justify-between bg-[#0a0a1f]/60 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="purple">v{script.version || 1}</Badge>
          <span className="text-xs text-white/40">
            {script.totalWordCount || 500} words • ~{Math.round((script.estimatedDuration || 270) / 60)} mins read
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSave} leftIcon={<Save className="h-3.5 w-3.5" />}>
            Save Changes
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
          <Button variant="outline" size="sm" onClick={onGenerate} isLoading={isGenerating} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
            Regenerate Script
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Video Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold h-12 text-white bg-white/[0.03] border-white/10"
          />
        </div>

        {/* Hook & Introduction */}
        <Card glass className="p-5 space-y-3 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300">Hook & Introduction</span>
            <Badge variant="default">Hook</Badge>
          </div>
          <Textarea
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            rows={3}
            className="text-sm text-white/90 leading-relaxed font-sans bg-transparent border-0 p-0 focus:ring-0"
          />
        </Card>

        {/* Chapters Breakdown */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/70">Main Chapters</h3>
          {script.chapters.map((ch, idx) => (
            <Card key={idx} glass className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">Chapter {ch.number || idx + 1}: {ch.title}</span>
                <span className="text-[11px] text-white/40">{ch.wordCount || 130} words</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{ch.content}</p>
            </Card>
          ))}
        </div>

        {/* Ending */}
        <Card glass className="p-5 space-y-3">
          <span className="text-xs font-semibold text-purple-300">Outro & Call to Action</span>
          <Textarea
            value={ending}
            onChange={(e) => setEnding(e.target.value)}
            rows={2}
            className="text-sm text-white/90 leading-relaxed bg-transparent border-0 p-0 focus:ring-0"
          />
        </Card>
      </div>
    </div>
  );
};
