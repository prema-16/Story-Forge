'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (strengthScore < 3) {
      toast.error('Please choose a stronger password');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password, confirmPassword });
      toast.success('Password reset successfully! Log in with your new password.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Set New Password" subtitle="Choose a strong, secure password for your account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="space-y-2">
          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-white/5">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`flex-1 transition-all ${
                  strengthScore >= level
                    ? strengthScore <= 2
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-white/30'}`}>
              <Check className="h-3 w-3" /> Min 8 characters
            </span>
            <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-400' : 'text-white/30'}`}>
              <Check className="h-3 w-3" /> Uppercase letter
            </span>
            <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-white/30'}`}>
              <Check className="h-3 w-3" /> Number
            </span>
            <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400' : 'text-white/30'}`}>
              <Check className="h-3 w-3" /> Special character
            </span>
          </div>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/50">Loading reset session...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
