'use client';

import React from 'react';
import { BarChart3, TrendingUp, Eye, Share2, DollarSign, ArrowLeft, Award, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '../../../components/layout/app-layout';

export default function ShortsAnalyticsPage() {
  const router = useRouter();

  return (
    <AppLayout title="AI Shorts Virality Analytics" subtitle="Real-time 3s/10s retention performance, completion rates, and cross-platform RPM metrics">
      <div className="analytics-container">
        
        <button onClick={() => router.push('/shorts-studio')} className="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1 inline" /> Back to Shorts Studio
        </button>

        {/* Top Metric Cards */}
        <div className="metrics-grid">
          <div className="stat-card">
            <div className="card-icon bg-purple-500/20 text-purple-400"><Eye className="w-5 h-5" /></div>
            <div className="stat-info">
              <span className="stat-label">Total Shorts Views</span>
              <span className="stat-value">1,450,200</span>
              <span className="stat-sub text-emerald-400">+24.5% vs last week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="card-icon bg-emerald-500/20 text-emerald-400"><TrendingUp className="w-5 h-5" /></div>
            <div className="stat-info">
              <span className="stat-label">Avg 3-Sec Retention</span>
              <span className="stat-value">89.2%</span>
              <span className="stat-sub text-emerald-400">Industry benchmark 75%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="card-icon bg-amber-500/20 text-amber-400"><Award className="w-5 h-5" /></div>
            <div className="stat-info">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">64.2%</span>
              <span className="stat-sub text-amber-400">Optimal 9:16 viral pacing</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="card-icon bg-pink-500/20 text-pink-400"><DollarSign className="w-5 h-5" /></div>
            <div className="stat-info">
              <span className="stat-label">Estimated Revenue</span>
              <span className="stat-value">$3,420.50</span>
              <span className="stat-sub text-purple-400">Avg RPM: $2.35</span>
            </div>
          </div>
        </div>

        {/* Retention Curve Visualizer */}
        <div className="chart-box">
          <h3 className="box-title"><BarChart3 className="w-5 h-5 text-purple-400 mr-2 inline" /> Audience Retention Curve (30-Sec Short)</h3>
          
          <div className="retention-visual">
            <div className="retention-point p1"><span>0:00 (Hook)</span><strong>100%</strong></div>
            <div className="retention-point p2"><span>0:03 (Open Loop)</span><strong>89.2%</strong></div>
            <div className="retention-point p3"><span>0:10 (Build-up)</span><strong>76.4%</strong></div>
            <div className="retention-point p4"><span>0:20 (Reveal)</span><strong>71.0%</strong></div>
            <div className="retention-point p5"><span>0:30 (CTA)</span><strong>64.2%</strong></div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="platform-box">
          <h3 className="box-title"><Sparkles className="w-5 h-5 text-emerald-400 mr-2 inline" /> Cross-Platform Performance Breakdown</h3>
          
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Views</th>
                  <th>CTR (%)</th>
                  <th>Avg Retention (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>YouTube Shorts</strong></td>
                  <td>720,000</td>
                  <td className="text-emerald-400 font-bold">12.1%</td>
                  <td>68.0%</td>
                  <td><span className="status-badge bg-emerald-500/20 text-emerald-400">VIRAL</span></td>
                </tr>
                <tr>
                  <td><strong>TikTok</strong></td>
                  <td>480,000</td>
                  <td>10.8%</td>
                  <td>62.5%</td>
                  <td><span className="status-badge bg-purple-500/20 text-purple-300">HIGH ENGAGEMENT</span></td>
                </tr>
                <tr>
                  <td><strong>Instagram Reels</strong></td>
                  <td>250,200</td>
                  <td>11.2%</td>
                  <td>61.8%</td>
                  <td><span className="status-badge bg-amber-500/20 text-amber-400">GROWING</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style jsx>{`
        .analytics-container { display: flex; flex-direction: column; gap: 20px; max-width: 1400px; }
        .back-btn { align-self: flex-start; padding: 8px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; cursor: pointer; }

        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .stat-card { padding: 20px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; display: flex; align-items: center; gap: 14px; }
        .card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: 900; color: #fff; line-height: 1.1; margin-top: 2px; }
        .stat-sub { font-size: 11px; margin-top: 2px; }

        .chart-box, .platform-box { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; display: flex; flex-direction: column; gap: 16px; }
        .box-title { font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; }

        .retention-visual { display: flex; justify-content: space-between; gap: 10px; padding: 24px 16px; background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 14px; flex-wrap: wrap; }
        .retention-point { text-align: center; }
        .retention-point span { font-size: 11px; color: rgba(255,255,255,0.5); display: block; }
        .retention-point strong { font-size: 20px; color: #34d399; font-weight: 900; display: block; margin-top: 4px; }

        .custom-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
        .custom-table th { padding: 12px; color: rgba(255,255,255,0.5); border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600; }
        .custom-table td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); }
        .status-badge { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 12px; }
      `}</style>
    </AppLayout>
  );
}
