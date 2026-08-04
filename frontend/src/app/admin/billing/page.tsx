'use client';

import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, Users, AlertCircle, CreditCard,
  Download, Filter, ArrowUpRight, ShieldCheck, Tag, Gift
} from 'lucide-react';
import { AppLayout } from '../../../components/layout/app-layout';
import { Card, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import toast from 'react-hot-toast';

export default function AdminBillingPage() {
  const [filterPeriod, setFilterPeriod] = useState('30d');

  const stats = {
    mrr: '₹14,85,000',
    arr: '₹1,78,20,000',
    activeSubscriptions: 1240,
    cancelledSubscriptions: 32,
    totalRevenue: '₹42,50,000',
    topPlan: 'Creator Plan (₹1,499/mo)',
    couponRedemptions: 412,
    failedPayments: 8,
  };

  const recentTransactions = [
    { id: 'tx_101', user: 'rahul.s@techcorp.in', plan: 'Creator Plan', amount: '₹1,768.82', status: 'Captured', gateway: 'Razorpay (UPI)', time: '5 mins ago' },
    { id: 'tx_102', user: 'priya.m@creatorstudio.io', plan: 'Professional Plan', amount: '₹3,538.82', status: 'Captured', gateway: 'Razorpay (Card)', time: '18 mins ago' },
    { id: 'tx_103', user: 'arun@digitalfirst.com', plan: 'Starter Plan', amount: '₹942.82', status: 'Captured', gateway: 'Razorpay (NetBanking)', time: '42 mins ago' },
    { id: 'tx_104', user: 'sneha@contenthouse.co', plan: 'Creator Plan', amount: '₹1,768.82', status: 'Failed', gateway: 'Razorpay (UPI)', time: '1 hour ago' },
  ];

  return (
    <AppLayout title="Revenue & Billing Management" subtitle="Enterprise SaaS MRR, ARR, active subscriptions, and gateway telemetry">
      <div className="space-y-6 max-w-6xl">
        {/* Metric Cards Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card glass className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Monthly Recurring (MRR)</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.mrr}</p>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +14.2% from last month
            </span>
          </Card>

          <Card glass className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Annual Run Rate (ARR)</span>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.arr}</p>
            <span className="text-[10px] text-purple-300 font-medium flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> Target ₹2.0 Cr ARR
            </span>
          </Card>

          <Card glass className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Active Subscriptions</span>
              <Users className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.activeSubscriptions}</p>
            <span className="text-[10px] text-white/40 font-mono">Churn: 2.1%</span>
          </Card>

          <Card glass className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Coupon Redemptions</span>
              <Tag className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stats.couponRedemptions}</p>
            <span className="text-[10px] text-cyan-300 font-mono">Active code: WELCOME20</span>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card glass className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-400" /> Recent Payment Transactions
              </CardTitle>
              <CardDescription>Razorpay live capture stream (UPI, Cards, NetBanking)</CardDescription>
            </div>

            <Button variant="secondary" size="sm" onClick={() => toast.success('Transactions exported to CSV')}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-white/40 font-mono">
              <tr>
                <th className="py-2">Transaction ID</th>
                <th className="py-2">User</th>
                <th className="py-2">Plan</th>
                <th className="py-2">Gateway / Method</th>
                <th className="py-2">Amount (incl. GST)</th>
                <th className="py-2">Status</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 font-mono text-purple-300">{tx.id}</td>
                  <td className="py-3 text-white font-medium">{tx.user}</td>
                  <td className="py-3 text-white/70">{tx.plan}</td>
                  <td className="py-3 text-white/50">{tx.gateway}</td>
                  <td className="py-3 font-mono text-white font-bold">{tx.amount}</td>
                  <td className="py-3">
                    <Badge variant={tx.status === 'Captured' ? 'completed' : 'failed'}>
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-white/40">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AppLayout>
  );
}
