'use client';
import React from 'react';
import { AppLayout } from '../../components/layout/app-layout';
import { StatCard } from '../../components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Video, Zap, Clock, TrendingUp, BarChart3, Layers, Server } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const projectStatsData = [
  { month: 'Jan', projects: 4, credits: 120 },
  { month: 'Feb', projects: 8, credits: 240 },
  { month: 'Mar', projects: 12, credits: 380 },
  { month: 'Apr', projects: 18, credits: 520 },
  { month: 'May', projects: 25, credits: 780 },
  { month: 'Jun', projects: 32, credits: 960 },
];

const providerUsageData = [
  { provider: 'OpenAI GPT-4o', count: 145 },
  { provider: 'ElevenLabs Voice', count: 98 },
  { provider: 'DALL-E 3', count: 82 },
  { provider: 'Runway Gen-2', count: 45 },
];

export default function AnalyticsPage() {
  return (
    <AppLayout title="Analytics & Usage" subtitle="Monitor project throughput, credit expenditure, and AI provider metrics">
      <div className="space-y-8 pb-12">
        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Video Projects" value="32" icon={<Video />} color="purple" change={24} />
          <StatCard label="Credits Expended" value="3,040" icon={<Zap />} color="cyan" change={15} />
          <StatCard label="Avg Gen Time / Video" value="2.1m" icon={<Clock />} color="green" change={-12} />
          <StatCard label="Active AI Providers" value="4" icon={<Server />} color="amber" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects Created Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Video Projects Created</CardTitle>
              <CardDescription>Monthly creation velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectStatsData}>
                    <defs>
                      <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0d20', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="projects" stroke="#ec4899" strokeWidth={3} fill="url(#colorProj)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Provider Execution Count */}
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Provider Usage</CardTitle>
              <CardDescription>Executions by AI service provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={providerUsageData}>
                    <XAxis dataKey="provider" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0d20', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
