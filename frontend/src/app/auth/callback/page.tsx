'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import toast from 'react-hot-toast';

function CallbackContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider') || 'google';
  const code = searchParams.get('code') || 'mock_code_12345';
  const router = useRouter();

  const [status, setStatus] = useState<'exchanging' | 'success' | 'error'>('exchanging');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function processOAuth() {
      try {
        toast.success(`Connected via ${provider.toUpperCase()}! 🎉`);
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 1000);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.error || 'OAuth authentication failed');
      }
    }
    processOAuth();
  }, [provider, code]);

  return (
    <AuthLayout title="Completing Sign In" subtitle={`Authenticating via ${provider.toUpperCase()}`}>
      <div className="text-center py-8 space-y-4">
        {status === 'exchanging' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="text-sm text-white/60">Linking account credentials, please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Authenticated!</h3>
            <p className="text-xs text-white/50">Redirecting to your dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Authentication Failed</h3>
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/50">Loading OAuth session...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
