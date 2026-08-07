'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Video,
  Layers,
  Globe,
  Mic,
  Zap,
} from 'lucide-react';
import { AppLayout } from '../../../components/layout/app-layout';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { GENRES, VIDEO_STYLES, ASPECT_RATIOS } from '../../../lib/utils';
import { projectsApi, CreateProjectData, Project } from '../../../lib/api';
import { useProjectStore } from '../../../store/projectStore';
import toast from 'react-hot-toast';

const wizardSteps = [
  { id: 1, title: 'Concept & Idea', description: 'What video do you want to create?' },
  { id: 2, title: 'Genre & Style', description: 'Pick visual tone and topic' },
  { id: 3, title: 'Technical Setup', description: 'Duration, aspect ratio, language' },
  { id: 4, title: 'Voice & AI Director', description: 'Narrator & orchestrator setup' },
  { id: 5, title: 'Review & Launch', description: 'Inspect credit plan and execute' },
];

export default function NewProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchProjects } = useProjectStore();

  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    idea: '',
    genre: 'documentary',
    videoLength: 5,
    style: 'cinematic',
    aspectRatio: '16:9',
    language: 'en',
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || formData.title.length < 3) {
        toast.error('Please enter a project title (min 3 chars)');
        return;
      }
      if (!formData.idea || formData.idea.length < 10) {
        toast.error('Please enter a detailed idea (min 10 chars)');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const handleLaunch = async () => {
    setIsSubmitting(true);
    const tid = toast.loading('Initializing AI Director workflow plan...');
    try {
      const { data } = await projectsApi.create(formData);
      if (typeof window !== 'undefined' && data?.project) {
        sessionStorage.setItem(`project_draft_${data.project._id}`, JSON.stringify(data.project));
      }
      toast.success('Workflow planned! Launching AI Studio...', { id: tid });
      router.push(`/projects/${data.project._id}`);
    } catch {
      // Demo fallback when backend API is offline
      const mockProjectId = `proj-${Date.now()}`;
      const draftProject = {
        _id: mockProjectId,
        userId: 'user_1',
        title: formData.title || 'Untitled Project',
        idea: formData.idea || 'Video project',
        genre: formData.genre || 'documentary',
        videoLength: formData.videoLength || 10,
        style: formData.style || 'cinematic',
        aspectRatio: formData.aspectRatio || '16:9',
        language: formData.language || 'en',
        status: 'draft',
        currentStep: 1,
        totalSteps: 10,
        creditsTotal: 35,
        creditsUsed: 0,
        workflowSteps: [
          { step: 'ai-writer', status: 'pending', creditsUsed: 0 },
          { step: 'ai-scene-planner', status: 'pending', creditsUsed: 0 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`project_draft_${mockProjectId}`, JSON.stringify(draftProject));
      }
      toast.success('Workflow planned! Launching AI Studio...', { id: tid });
      router.push(`/projects/${mockProjectId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="New Project Wizard" subtitle="AI Director workflow orchestrator configuration">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Stepper Header */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 pt-1 px-1 -mx-2 sm:mx-0">
          {wizardSteps.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isDone && setCurrentStep(step.id)}
                className={`flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-purple-600/20 border border-purple-500/40 text-white'
                    : isDone
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border border-white/10 text-white/40'
                }`}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.id}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${isCurrent ? 'text-white' : 'text-white/50'}`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Cards */}
        <Card className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Step 1: Idea & Title */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">Project Concept</h2>
                    <p className="text-sm text-white/50">Give your project a name and state your core idea.</p>
                  </div>
                  <Input
                    label="Project Title"
                    placeholder="e.g. The Untold Story of Dark Matter"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <Textarea
                    label="Core Video Idea / Prompt"
                    placeholder="Describe what the video is about in detail. e.g. Explore the mystery of dark matter in deep space, starting with galactic rotational anomalies discovered by Vera Rubin, transitioning into quantum particle theories."
                    rows={5}
                    value={formData.idea}
                    onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  />
                </div>
              )}

              {/* Step 2: Genre & Style */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Genre & Visual Style</h2>
                    <p className="text-sm text-white/50">Select topic and visual aesthetic for AI image prompts.</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 block mb-3">Genre Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {GENRES.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, genre: g.value })}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                            formData.genre === g.value
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 block mb-3">Visual Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {VIDEO_STYLES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, style: s.value })}
                          className={`p-4 rounded-xl border text-sm font-semibold transition-all text-left ${
                            formData.style === s.value
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Technical Setup */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Technical Parameters</h2>
                    <p className="text-sm text-white/50">Configure length, resolution format, and language.</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 block mb-2">
                      Target Duration: <span className="text-purple-400 font-bold">{formData.videoLength} minutes</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={formData.videoLength}
                      onChange={(e) => setFormData({ ...formData, videoLength: Number(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>1 min (Short)</span>
                      <span>15 min (Standard)</span>
                      <span>30 min (Deep Dive)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 block mb-3">Aspect Ratio</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ASPECT_RATIOS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, aspectRatio: r.value })}
                          className={`p-4 rounded-xl border text-sm font-semibold transition-all text-center ${
                            formData.aspectRatio === r.value
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Voice & Preferences */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Voice & Language</h2>
                    <p className="text-sm text-white/50">Select audio voice narration preferences.</p>
                  </div>

                  <Input
                    label="Language Code"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    hint="Default: en (English). Supports es, fr, de, hi, etc."
                  />

                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                    <Mic className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">AI Narration Provider</h4>
                      <p className="text-xs text-white/50 mt-0.5">
                        ElevenLabs & OpenAI Voice engines will be configured automatically by the AI Director based on cost and availability.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Launch */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Review & Launch AI Pipeline</h2>
                    <p className="text-sm text-white/50">Inspect your project configuration before sending to AI Director.</p>
                  </div>

                  <div className="glass rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between border-b border-white/10 pb-3">
                      <span className="text-sm text-white/50">Title</span>
                      <span className="text-sm font-semibold text-white">{formData.title}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-3">
                      <span className="text-sm text-white/50">Genre & Style</span>
                      <span className="text-sm font-semibold text-white capitalize">{formData.genre} • {formData.style}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-3">
                      <span className="text-sm text-white/50">Duration & Ratio</span>
                      <span className="text-sm font-semibold text-white">{formData.videoLength} mins • {formData.aspectRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">Est. AI Credits</span>
                      <span className="text-sm font-bold text-purple-400">~25 Credits</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            {currentStep > 1 ? (
              <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleLaunch}
                isLoading={isSubmitting}
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Launch AI Pipeline
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
