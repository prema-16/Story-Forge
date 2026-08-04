'use client';

import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckSquare,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function EnterpriseWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'workspaces' | 'review' | 'calendar' | 'brand'>('workspaces');

  const workspaces = [
    { id: 'ws_social_reels', dept: 'Global Marketing', name: 'Social Shortform Video Workspace', members: 18, storage: '1.2 TB / 5 TB', renders: '450 / 2,000' },
    { id: 'ws_brand_campaigns', dept: 'Brand & Creative Ops', name: '2026 Brand Campaign Videos', members: 12, storage: '840 GB / 2 TB', renders: '210 / 1,000' },
  ];

  const reviewPipeline = [
    { project: 'Quantum Physics: Secrets of the Universe', brandGate: 'Approved', legalGate: 'Approved', publishingGate: 'Pending Approval', author: 'Sarah AI' },
    { project: 'Cyberpunk Crime Confidential', brandGate: 'Approved', legalGate: 'Pending Approval', publishingGate: 'Locked', author: 'Alex Motion' },
  ];

  const handleApproveGate = (project: string, gate: string) => {
    toast.success(`Approved '${gate}' gate for '${project}'!`);
  };

  return (
    <AppLayout title="Enterprise Workspace" subtitle="Department Governance, Multi-Tier Content Review Pipeline & Brand Compliance">
      <div className="space-y-8 max-w-6xl">
        {/* Top Tabs */}
        <div className="flex border-b border-white/[0.08] gap-6 text-sm font-medium">
          {[
            { id: 'workspaces', label: 'Departments & Workspaces', icon: Building2 },
            { id: 'review', label: 'Content Review Pipeline', icon: ShieldCheck },
            { id: 'calendar', label: 'AI Content Calendar', icon: Calendar },
            { id: 'brand', label: 'Brand Knowledge Base', icon: Award },
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

        {/* Tab 1: Workspaces */}
        {activeTab === 'workspaces' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-400" /> Enterprise Workspaces & Quotas
              </span>
              <Badge variant="running">Enterprise Tier</Badge>
            </CardTitle>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {workspaces.map((w) => (
                <div key={w.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{w.name}</h4>
                    <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                      {w.dept}
                    </span>
                  </div>
                  <div className="text-xs text-white/50 space-y-1 font-mono">
                    <p>Members: <span className="text-white">{w.members} creators</span></p>
                    <p>Storage: <span className="text-white">{w.storage}</span></p>
                    <p>Monthly Renders: <span className="text-white">{w.renders}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 2: Content Review Pipeline */}
        {activeTab === 'review' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" /> Multi-Tier Approval Pipeline (Legal, Brand, Publishing)
            </CardTitle>

            <div className="space-y-3 pt-2">
              {reviewPipeline.map((r) => (
                <div key={r.project} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{r.project}</h4>
                    <p className="text-xs text-white/40">Created by {r.author}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
                      Brand: {r.brandGate}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
                      Legal: {r.legalGate}
                    </span>
                    <Button variant="primary" size="sm" onClick={() => handleApproveGate(r.project, 'Publishing')}>
                      Approve Publishing
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 3: AI Content Calendar */}
        {activeTab === 'calendar' && (
          <Card glass className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" /> AI Content Schedule & Publication Calendar
            </CardTitle>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-purple-300 space-y-2">
              <p>[Aug 04, 2026]: <span className="text-white font-bold">Quantum Computing Breakdown 2026</span> (1080p Documentary) ➔ Scheduled for YouTube</p>
              <p>[Aug 06, 2026]: <span className="text-white font-bold">Top 5 Space Anomalies</span> (Vertical Reel) ➔ Scheduled for TikTok & Instagram</p>
              <p>[Aug 08, 2026]: <span className="text-white font-bold">Cyberpunk Cybernetics Explained</span> (16:9 Video) ➔ Scheduled for X & Vimeo</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
