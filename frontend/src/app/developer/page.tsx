'use client';

import React, { useState } from 'react';
import {
  Code,
  Key,
  Webhook,
  Terminal,
  Copy,
  Check,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function DeveloperPortalPage() {
  const [apiKey, setApiKey] = useState('sf_live_9948274a819b2746c10928374628109');
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('API Key copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout title="Developer Portal" subtitle="Programmatic REST API Keys, Webhooks Subscriptions & Developer Integration SDKs">
      <div className="space-y-6 max-w-5xl">
        {/* API Key Card */}
        <Card glass className="p-6 space-y-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Key className="h-4 w-4 text-purple-400" /> Programmatic API Keys
            </span>
            <Button variant="secondary" size="sm">
              Generate New Key
            </Button>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Input readOnly value={apiKey} className="font-mono text-xs bg-slate-950 border-white/10 text-emerald-400 flex-1" />
            <Button variant="ghost" size="sm" onClick={copyKey}>
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        {/* API Quickstart Code Snippet */}
        <Card glass className="p-6 space-y-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4 text-purple-400" /> cURL Quickstart Request
          </CardTitle>
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto">
            <p>curl -X POST https://api.storyforge.ai/api/production/render \</p>
            <p>  -H &quot;Authorization: Bearer {apiKey}&quot; \</p>
            <p>  -H &quot;Content-Type: application/json&quot; \</p>
            <p>  -d &apos;{JSON.stringify({ projectId: "proj_101", resolution: "1080p", format: "mp4" })}&apos;</p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
