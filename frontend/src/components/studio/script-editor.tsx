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
import { useStudioStore } from '../../store/studioStore';
import toast from 'react-hot-toast';

interface ScriptEditorProps {
  script: Script | null;
  projectId?: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ScriptEditor = ({ script, projectId, onGenerate, isGenerating }: ScriptEditorProps) => {
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState(script?.title || '');
  const [introduction, setIntroduction] = useState(script?.introduction || '');
  const [ending, setEnding] = useState(script?.ending || '');
  const [customScriptText, setCustomScriptText] = useState('');
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  const { saveScript } = useStudioStore();

  useEffect(() => {
    if (script) {
      setTitle(script.title || '');
      setIntroduction(script.introduction || '');
      setEnding(script.ending || '');
    }
  }, [script]);

  const handleSaveCustom = async () => {
    if (!projectId) return;
    if (!customScriptText.trim() && !introduction.trim()) {
      toast.error('Please paste or enter your script content');
      return;
    }
    setIsSavingCustom(true);
    try {
      await saveScript(projectId, {
        title: title || 'Custom Video Script',
        introduction: introduction || customScriptText,
        scriptText: customScriptText || introduction,
        ending: ending || 'Thank you for watching.',
      });
    } catch {
      // Error handled by store toast
    } finally {
      setIsSavingCustom(false);
    }
  };

  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 max-w-xl mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <FileText className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">No Script Found for this Project</h3>
          <p className="text-xs text-white/50 mt-1">
            Generate a fresh script using AIWriter or paste your own custom script below to generate scenes & narration.
          </p>
        </div>

        <div className="w-full space-y-3 text-left bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <label className="text-xs font-semibold text-purple-400">Paste Your Own Custom Script</label>
          <Textarea
            value={customScriptText}
            onChange={(e) => setCustomScriptText(e.target.value)}
            placeholder="Paste your narration script or story paragraphs here..."
            rows={5}
            className="text-sm bg-black/40 text-white border-white/10"
          />
          <Button
            onClick={handleSaveCustom}
            isLoading={isSavingCustom}
            variant="primary"
            size="sm"
            className="w-full"
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            Create Scenes & Voice from My Script
          </Button>
        </div>

        <div className="relative w-full flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#050512] px-3 text-[11px] text-white/40 uppercase font-semibold absolute">or</span>
        </div>

        <Button onClick={onGenerate} isLoading={isGenerating} variant="outline" size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
          Generate Script with AIWriter
        </Button>
      </div>
    );
  }

  const handleCopy = () => {
    const fullText = `${title}\n\n${introduction}\n\n${(script.chapters || []).map((c) => c.content).join('\n\n')}\n\n${ending}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!projectId) {
      toast.success('Script updated!');
      return;
    }
    await handleSaveCustom();
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
