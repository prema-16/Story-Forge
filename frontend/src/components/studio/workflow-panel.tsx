'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Layers, Mic, Image, BarChart2, Video,
  CheckCircle2, Loader2, AlertCircle, Clock, ChevronRight,
  Zap, Play,
} from 'lucide-react';
import { Project } from '../../lib/api';
import { STEP_AGENT_MAP, type GenerationStepKey } from '@storyforge/shared';

interface WorkflowPanelProps {
  project: Project | null;
  isGenerating: Record<string, boolean>;
  activeJobId: string | null;
  progress: number;
  onGenerate: (step: string) => void;
}

const STEPS = [
  {
    id: 'script',
    jobKey: 'script',
    label: 'Script',
    description: 'Generate full video script with chapters',
    icon: FileText,
    credits: 5,
    agentName: 'AIWriter',
    step: 1,
  },
  {
    id: 'scenes',
    jobKey: 'scenes',
    label: 'Scenes',
    description: 'Break script into cinematic scenes',
    icon: Layers,
    credits: 3,
    agentName: 'AIScenePlanner',
    step: 2,
    requires: ['script'],
  },
  {
    id: 'prompts',
    jobKey: 'prompts',
    label: 'AI Prompts',
    description: 'Generate visual prompts for each scene',
    icon: Layers,
    credits: 3,
    agentName: 'AIPromptEngineer',
    step: 3,
    requires: ['scenes'],
  },
  {
    id: 'voice',
    jobKey: 'voice',
    label: 'Voice',
    description: 'Synthesize narration audio',
    icon: Mic,
    credits: 10,
    agentName: 'AIVoiceDirector',
    step: 4,
    requires: ['script'],
  },
  {
    id: 'thumbnail',
    jobKey: 'thumbnail',
    label: 'Thumbnail',
    description: 'Design high-CTR thumbnail',
    icon: Image,
    credits: 8,
    agentName: 'AIThumbnailDesigner',
    step: 5,
    requires: ['script'],
  },
  {
    id: 'seo',
    jobKey: 'seo',
    label: 'SEO',
    description: 'Generate YouTube metadata',
    icon: BarChart2,
    credits: 2,
    agentName: 'AISEOSpecialist',
    step: 6,
    requires: ['script'],
  },
];

export function WorkflowPanel({ project, isGenerating, activeJobId, progress, onGenerate }: WorkflowPanelProps) {
  const workflowSteps = project?.workflowSteps || [];

  /**
   * Get the backend status of a workflow step by its frontend ID.
   * Uses STEP_AGENT_MAP to reliably match frontend step IDs to backend agent names.
   * Fixes the previous fragile string.includes() approach that broke for 'prompts'.
   */
  const getStepStatus = (stepId: string): string => {
    if (isGenerating[stepId]) return 'running';
    const agentNames = STEP_AGENT_MAP[stepId as GenerationStepKey] ?? [stepId];
    const match = workflowSteps.find((ws) =>
      agentNames.some((name) => ws.step === name || ws.step.includes(name))
    );
    return match?.status ?? 'pending';
  };

  const canRunStep = (stepConfig: typeof STEPS[0]): boolean => {
    if (isGenerating[stepConfig.jobKey]) return false;
    if (!stepConfig.requires || stepConfig.requires.length === 0) return true;
    return stepConfig.requires.every((req) => getStepStatus(req) === 'completed');
  };

  const totalCreditsUsed = project?.creditsUsed ?? 0;
  const totalCreditsEstimated = project?.creditsTotal ?? 0;

  return (
    <div className="workflow-panel">
      {/* Header stats */}
      <div className="workflow-stats">
        <div className="stat-item">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="stat-value">{totalCreditsUsed}</span>
          <span className="stat-label">/ {totalCreditsEstimated} credits</span>
        </div>
        <div className="stat-item">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="stat-value">{project?.currentStep ?? 0}</span>
          <span className="stat-label">/ {project?.totalSteps ?? 10} steps</span>
        </div>
      </div>

      {/* Active job progress bar */}
      <AnimatePresence>
        {activeJobId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="active-job-card"
          >
            <div className="job-header">
              <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin" />
              <span>Processing job...</span>
              <span className="job-pct">{progress}%</span>
            </div>
            <div className="job-progress-track">
              <motion.div
                className="job-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step list */}
      <div className="steps-list">
        {STEPS.map((stepConfig, i) => {
          const status = getStepStatus(stepConfig.id);
          const isRunning = isGenerating[stepConfig.jobKey];
          const canRun = canRunStep(stepConfig);
          const Icon = stepConfig.icon;

          return (
            <motion.div
              key={stepConfig.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`step-card ${status} ${isRunning ? 'running' : ''}`}
            >
              <div className="step-icon-wrapper">
                <div className={`step-icon-bg ${status}`}>
                  {isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : status === 'completed' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : status === 'failed' ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
              </div>

              <div className="step-content">
                <div className="step-header">
                  <span className="step-label">{stepConfig.label}</span>
                  <span className="step-agent">{stepConfig.agentName}</span>
                </div>
                <p className="step-description">{stepConfig.description}</p>

                {isRunning && progress > 0 && (
                  <div className="step-mini-progress">
                    <div className="step-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              <div className="step-action">
                <span className="step-credits">
                  <Zap className="h-2.5 w-2.5" /> {stepConfig.credits}
                </span>
                {status !== 'completed' && (
                  <button
                    className={`step-run-btn ${canRun ? 'can-run' : 'disabled'}`}
                    onClick={() => canRun && onGenerate(stepConfig.id)}
                    disabled={!canRun || isRunning}
                    title={canRun ? `Generate ${stepConfig.label}` : 'Complete previous steps first'}
                  >
                    {isRunning ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .workflow-panel { display: flex; flex-direction: column; gap: 12px; }
        .workflow-stats { display: flex; gap: 12px; }
        .stat-item { display: flex; align-items: center; gap: 4px; font-size: 11px; }
        .stat-value { font-weight: 700; color: rgba(255,255,255,0.8); }
        .stat-label { color: rgba(255,255,255,0.3); }

        .active-job-card {
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 10px;
          padding: 10px 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .job-header { display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.7); }
        .job-pct { margin-left: auto; font-weight: 700; color: #a78bfa; }
        .job-progress-track { height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .job-progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #ec4899); border-radius: 2px; }

        .steps-list { display: flex; flex-direction: column; gap: 6px; }
        .step-card {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          transition: all 0.15s ease;
        }
        .step-card.running { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.05); }
        .step-card.completed { border-color: rgba(16,185,129,0.15); background: rgba(16,185,129,0.03); }
        .step-card.failed { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.03); }
        .step-card:hover { background: rgba(255,255,255,0.04); }

        .step-icon-wrapper { flex-shrink: 0; }
        .step-icon-bg {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.4);
        }
        .step-icon-bg.running { background: rgba(124,58,237,0.15); color: #a78bfa; }
        .step-icon-bg.completed { background: rgba(16,185,129,0.1); }
        .step-icon-bg.failed { background: rgba(239,68,68,0.1); }

        .step-content { flex: 1; min-width: 0; }
        .step-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
        .step-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .step-agent { font-size: 9px; color: rgba(124,58,237,0.7); font-weight: 600; letter-spacing: 0.05em; }
        .step-description { font-size: 10px; color: rgba(255,255,255,0.3); line-height: 1.4; }
        .step-mini-progress { height: 2px; background: rgba(255,255,255,0.08); border-radius: 1px; overflow: hidden; margin-top: 6px; }
        .step-progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #ec4899); border-radius: 1px; transition: width 0.3s ease; }

        .step-action { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .step-credits { display: flex; align-items: center; gap: 2px; font-size: 10px; color: rgba(245,158,11,0.6); }
        .step-run-btn {
          width: 24px; height: 24px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.15s;
        }
        .step-run-btn.can-run { background: rgba(124,58,237,0.3); color: #a78bfa; }
        .step-run-btn.can-run:hover { background: rgba(124,58,237,0.5); }
        .step-run-btn.disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.2); cursor: not-allowed; }
      `}</style>
    </div>
  );
}
