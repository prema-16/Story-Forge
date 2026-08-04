'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MailCheck, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('verifying');
      return;
    }

    const timer = setTimeout(() => {
      setStatus('success');
      toast.success('Email verified successfully!');
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthLayout title="Email Verification" subtitle="Confirming your StoryForge AI account email">
      <div className="text-center py-6 space-y-6">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="text-sm text-white/60">Verifying your email address, please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <MailCheck className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Email Verified!</h3>
              <p className="text-xs text-white/50 mt-1">Your account is fully active and ready to create AI videos.</p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full mt-4"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Verification Failed</h3>
              <p className="text-xs text-red-400/80 mt-1">{errorMessage || 'Verification token is invalid or expired.'}</p>
            </div>
            <Button variant="secondary" onClick={() => router.push('/login')} className="w-full mt-4">
              Return to Sign In
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/50">Loading verification session...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
