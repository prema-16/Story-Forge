'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../../components/layout/app-layout';
import { Card, CardTitle, CardDescription } from '../../../components/ui/card';
import { StatCard } from '../../../components/ui/stat-card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Cpu,
  Server,
  Activity,
  Pause,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../../lib/api';

interface QueueMetric {
  queueName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface WorkerMeta {
  name: string;
  status: 'online' | 'offline' | 'recovering';
  startedAt: string;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  memoryMb: number;
  cpuPercent: number;
  version: string;
}

export default function AdminQueuesPage() {
  const [redisStatus, setRedisStatus] = useState<'connected' | 'error' | 'disconnected'>('connected');
  const [queues, setQueues] = useState<QueueMetric[]>([]);
  const [workers, setWorkers] = useState<WorkerMeta[]>([]);
  const [isLive, setIsLive] = useState(true);

  const fetchSnapshot = async () => {
    try {
      const res: any = await api.get('/admin/queues');
      if (res) {
        setRedisStatus(res.redisStatus || 'connected');
        setQueues(res.queues || []);
        setWorkers(res.workers || []);
      }
    } catch {
      // Fallback display if SSE/API disconnected
      setRedisStatus('error');
    }
  };

  useEffect(() => {
    fetchSnapshot();

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const sseUrl = `${baseUrl}/admin/queues/sse`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setRedisStatus(data.redisStatus);
        setQueues(data.queues || []);
        setWorkers(data.workers || []);
        setIsLive(true);
      } catch (e) {
        console.error('SSE JSON parse error:', e);
      }
    };

    eventSource.onerror = () => {
      setIsLive(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handlePause = async (queueName: string) => {
    try {
      await api.post(`/admin/queues/${queueName}/pause`);
      toast.success(`Queue '${queueName}' paused`);
      fetchSnapshot();
    } catch {
      toast.error(`Failed to pause queue '${queueName}'`);
    }
  };

  const handleResume = async (queueName: string) => {
    try {
      await api.post(`/admin/queues/${queueName}/resume`);
      toast.success(`Queue '${queueName}' resumed`);
      fetchSnapshot();
    } catch {
      toast.error(`Failed to resume queue '${queueName}'`);
    }
  };

  const handleRetry = async (queueName: string) => {
    try {
      await api.post(`/admin/queues/${queueName}/retry`);
      toast.success(`Retried failed jobs in '${queueName}'`);
      fetchSnapshot();
    } catch {
      toast.error(`Failed to retry jobs in '${queueName}'`);
    }
  };

  const totalWaiting = queues.reduce((acc, q) => acc + q.waiting, 0);
  const totalActive = queues.reduce((acc, q) => acc + q.active, 0);
  const totalCompleted = queues.reduce((acc, q) => acc + q.completed, 0);
  const totalFailed = queues.reduce((acc, q) => acc + q.failed, 0);

  return (
    <AppLayout
      title="Smart Queue & Worker Dashboard"
      subtitle="Production BullMQ monitoring, worker cluster telemetry, and dead-letter recovery"
    >
      <div className="space-y-8 pb-12">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Redis Status"
            value={redisStatus.toUpperCase()}
            icon={<Server />}
            color={redisStatus === 'connected' ? 'green' : 'pink'}
            changeLabel={redisStatus === 'connected' ? 'Port 6379 Active' : 'Disconnected'}
          />
          <StatCard
            label="Active Workers"
            value={`${workers.length} Online`}
            icon={<Cpu />}
            color="purple"
            changeLabel="Auto-scaled Worker Swarm"
          />
          <StatCard
            label="Running / Waiting Jobs"
            value={`${totalActive} Active / ${totalWaiting} Wait`}
            icon={<Activity />}
            color="cyan"
            changeLabel="Live BullMQ Queue Depth"
          />
          <StatCard
            label="Total Completed / Failed"
            value={`${totalCompleted} / ${totalFailed}`}
            icon={<Zap />}
            color={totalFailed > 0 ? 'amber' : 'green'}
            changeLabel={isLive ? '● Live Stream Connected' : 'Snapshot Mode'}
          />
        </div>

        {/* Workers Status Cluster */}
        <Card glass className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registered BullMQ Worker Cluster</CardTitle>
              <CardDescription>Live health and workload metrics for registered workers</CardDescription>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchSnapshot} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Refresh Metrics
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {workers.map((w) => (
              <div
                key={w.name}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{w.name}</h4>
                  <Badge variant={w.status === 'online' ? 'completed' : 'failed'}>
                    {w.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-white/50 space-y-1">
                  <div>Active: <span className="text-white font-semibold">{w.activeJobs}</span></div>
                  <div>Completed: <span className="text-emerald-400 font-semibold">{w.completedJobs}</span></div>
                  <div>Failed: <span className="text-red-400 font-semibold">{w.failedJobs}</span></div>
                  <div>Memory: <span className="text-purple-300 font-semibold">{w.memoryMb} MB</span></div>
                </div>
              </div>
            ))}
            {workers.length === 0 && (
              <div className="col-span-full py-8 text-center text-white/40 text-sm">
                No workers registered or Redis offline.
              </div>
            )}
          </div>
        </Card>

        {/* Queues Table */}
        <Card glass className="p-6 space-y-4">
          <CardTitle>BullMQ Queue Status & Controls</CardTitle>
          <CardDescription>Manage queue lifecycle, pause execution, or flush failed tasks</CardDescription>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="text-xs text-white/40 uppercase bg-white/[0.02] border-b border-white/[0.08]">
                <tr>
                  <th className="p-3">Queue Name</th>
                  <th className="p-3">Waiting</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Completed</th>
                  <th className="p-3">Failed</th>
                  <th className="p-3">Delayed</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {queues.map((q) => (
                  <tr key={q.queueName} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-white capitalize">{q.queueName}</td>
                    <td className="p-3">{q.waiting}</td>
                    <td className="p-3 text-cyan-400 font-semibold">{q.active}</td>
                    <td className="p-3 text-emerald-400">{q.completed}</td>
                    <td className="p-3 text-red-400">{q.failed}</td>
                    <td className="p-3 text-amber-400">{q.delayed}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePause(q.queueName)}
                        leftIcon={<Pause className="h-3 w-3" />}
                      >
                        Pause
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResume(q.queueName)}
                        leftIcon={<Play className="h-3 w-3" />}
                      >
                        Resume
                      </Button>
                      {q.failed > 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRetry(q.queueName)}
                          leftIcon={<RotateCcw className="h-3 w-3" />}
                        >
                          Retry Failed
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {queues.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-white/40">
                      No queues active or backend API offline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
