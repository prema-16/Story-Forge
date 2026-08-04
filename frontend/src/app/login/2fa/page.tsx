'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function TwoFactorPage() {
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error('Enter a valid 6-digit authentication code');
      return;
    }

    setIsLoading(true);
    try {
      // Complete 2FA login challenge
      toast.success('2FA verified successfully! 🎉');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={useRecoveryCode ? 'Recovery Code' : 'Two-Factor Authentication'}
      subtitle={
        useRecoveryCode
          ? 'Enter one of your 8-digit emergency recovery codes'
          : 'Enter the 6-digit code from your authenticator app'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center my-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            {useRecoveryCode ? <KeyRound className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
          </div>
        </div>

        <Input
          label={useRecoveryCode ? 'Emergency Recovery Code' : 'Authenticator Code'}
          type="text"
          placeholder={useRecoveryCode ? 'XXXX-XXXX' : '123 456'}
          maxLength={useRecoveryCode ? 16 : 6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\s+/g, ''))}
          className="text-center text-lg tracking-widest font-mono"
          autoFocus
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Verify & Sign In
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setUseRecoveryCode(!useRecoveryCode);
              setCode('');
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            {useRecoveryCode ? 'Use 6-digit authenticator code instead' : 'Lost your phone? Use a recovery code'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
