'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, UserPlus, Shield, Plus, Mail } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function OrganizationPage() {
  const [orgName, setOrgName] = useState('Acme Studios');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isSending, setIsSending] = useState(false);

  const members = [
    { name: 'Jane Doe', email: 'jane@acme.com', role: 'owner', joined: 'Aug 1, 2026' },
    { name: 'Alex Smith', email: 'alex@acme.com', role: 'admin', joined: 'Jul 28, 2026' },
    { name: 'Sarah Chen', email: 'sarah@acme.com', role: 'member', joined: 'Jul 15, 2026' },
  ];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsSending(true);
    setTimeout(() => {
      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setIsSending(false);
    }, 800);
  };

  return (
    <AppLayout title="Organization Settings" subtitle="Manage your multi-tenant organization, team members, and RBAC roles">
      <div className="space-y-8 max-w-5xl">
        {/* Org Info Header */}
        <Card glass className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display">{orgName}</h2>
                <p className="text-xs text-white/40">slug: acme-studios • Enterprise Plan • 3 Active Members</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Create Workspace Team
            </Button>
          </div>
        </Card>

        {/* Invite Member Section */}
        <Card glass className="p-6 space-y-4">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-purple-400" /> Invite Team Member
          </CardTitle>
          <CardDescription>Send an email invitation link with specific RBAC role permissions</CardDescription>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 pt-2">
            <Input
              type="email"
              placeholder="colleague@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm outline-none font-medium"
            >
              <option value="admin" className="bg-slate-900">Admin</option>
              <option value="member" className="bg-slate-900">Member (Editor)</option>
              <option value="guest" className="bg-slate-900">Guest (Viewer)</option>
            </select>
            <Button type="submit" variant="primary" isLoading={isSending}>
              Send Invitation
            </Button>
          </form>
        </Card>

        {/* Member Roster */}
        <Card glass className="p-6 space-y-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" /> Members & Roles
          </CardTitle>

          <div className="divide-y divide-white/[0.06]">
            {members.map((member) => (
              <div key={member.email} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-white/40">{member.email} • Joined {member.joined}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.role === 'owner' ? 'completed' : 'running'} className="capitalize">
                    {member.role}
                  </Badge>
                  {member.role !== 'owner' && (
                    <button className="text-xs text-red-400/70 hover:text-red-400 transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
