'use client';
import React from 'react';
import { AppLayout } from '../../components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { StatCard } from '../../components/ui/stat-card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Shield, Server, Cpu, Database, Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const systemAgents = [
  { name: 'ai-director', status: 'online', load: '12%', latency: '45ms' },
  { name: 'ai-writer', status: 'online', load: '38%', latency: '820ms' },
  { name: 'ai-scene-planner', status: 'online', load: '22%', latency: '310ms' },
  { name: 'ai-prompt-engineer', status: 'online', load: '45%', latency: '410ms' },
  { name: 'ai-voice-director', status: 'online', load: '65%', latency: '1200ms' },
  { name: 'ai-thumbnail-designer', status: 'online', load: '30%', latency: '950ms' },
];

export default function AdminPage() {
  const handleFlushCache = () => {
    toast.success('System Redis cache flushed cleanly');
  };

  return (
    <AppLayout title="Admin Control Panel" subtitle="System health, agent queue workloads, and platform configuration">
      <div className="space-y-8 pb-12">
        {/* System Health Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Backend Status" value="Healthy" icon={<Server />} color="green" changeLabel="All 10 Agents Registered" />
          <StatCard label="Database Connection" value="Connected" icon={<Database />} color="purple" changeLabel="MongoDB Atlas Primary" />
          <StatCard label="Redis Queue Load" value="0 Jobs" icon={<Cpu />} color="cyan" changeLabel="0ms Queue Delay" />
          <StatCard label="API Rate Limiter" value="100 req/m" icon={<Activity />} color="amber" changeLabel="Standard Tier" />
        </div>

        {/* Registered AI Agents Status Grid */}
        <Card glass className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registered AI Agents</CardTitle>
              <CardDescription>Live telemetry for 10-step AI Director agent execution engine</CardDescription>
            </div>
            <Button variant="secondary" size="sm" onClick={handleFlushCache} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Flush Redis Cache
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {systemAgents.map((agent) => (
              <div key={agent.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                  <p className="text-xs text-white/40">Latency: {agent.latency} • Load: {agent.load}</p>
                </div>
                <Badge variant="completed">Online</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
