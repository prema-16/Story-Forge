'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? 'Login failed. Please check your credentials.';
      toast.error(msg);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'demo@storyforge.ai');
    setValue('password', 'StoryForge#2026!');
    toast.success('Demo credentials filled!');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue creating amazing videos">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
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
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span className="text-sm text-white/50">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign in
        </Button>

        <p className="text-center text-sm text-white/40">
          Don't have an account?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </form>

      {/* Demo hint with auto-fill (Only visible when DEV_ENTERPRISE_MODE is explicitly enabled) */}
      {process.env.NEXT_PUBLIC_DEV_ENTERPRISE_MODE === 'true' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleFillDemo}
          className="mt-6 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center cursor-pointer hover:bg-purple-500/15 transition-all"
        >
          <p className="text-xs text-white/60 font-medium">
            ⚡ Quick Demo Login: <span className="text-purple-300">demo@storyforge.ai</span> /{' '}
            <span className="text-purple-300">StoryForge#2026!</span>
            <span className="block text-[10px] text-purple-400/70 mt-0.5">(Click here to auto-fill)</span>
          </p>
        </motion.div>
      )}
    </AuthLayout>
  );
}
