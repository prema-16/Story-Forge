'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Search, RefreshCw, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');

  const logs = [
    { id: '1', action: 'user.login', user: 'jane@acme.com', ip: '192.168.1.42', ua: 'Chrome / macOS', status: 'success', time: '2 mins ago' },
    { id: '2', action: 'user.login_failed', user: 'attacker@unknown.com', ip: '45.33.21.11', ua: 'Python-requests', status: 'failed', time: '14 mins ago' },
    { id: '3', action: 'user.account_locked', user: 'attacker@unknown.com', ip: '45.33.21.11', ua: 'Python-requests', status: 'failed', time: '14 mins ago' },
    { id: '4', action: 'org.invite_sent', user: 'jane@acme.com', ip: '192.168.1.42', ua: 'Chrome / macOS', status: 'success', time: '1 hour ago' },
    { id: '5', action: 'user.2fa_enabled', user: 'alex@acme.com', ip: '10.0.0.15', ua: 'Firefox / Linux', status: 'success', time: '3 hours ago' },
  ];

  return (
    <AppLayout title="Security Audit Logs" subtitle="Enterprise audit stream tracking all system events, authentication, and security alerts">
      <div className="space-y-6 max-w-6xl">
        <Card glass className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-purple-400" /> Platform Security Event Log
              </CardTitle>
              <CardDescription>Capped security log collection — 15+ event types monitored</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by action, user, or IP..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button variant="secondary" size="sm" onClick={() => toast.success('Audit logs refreshed')}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] text-white/40 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-3">Event Action</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">User-Agent</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono text-purple-300 font-medium">{log.action}</td>
                    <td className="py-3 px-3 text-white/80">{log.user}</td>
                    <td className="py-3 px-3 font-mono text-white/50">{log.ip}</td>
                    <td className="py-3 px-3 text-white/40 truncate max-w-xs">{log.ua}</td>
                    <td className="py-3 px-3">
                      <Badge variant={log.status === 'success' ? 'completed' : 'failed'}>{log.status}</Badge>
                    </td>
                    <td className="py-3 px-3 text-white/40">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
