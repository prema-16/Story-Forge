'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => (
  <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    {/* Animated background blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-pink-600/15 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-600/10 blur-3xl"
      />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400 shadow-xl shadow-purple-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-xl leading-none">StoryForge</div>
            <div className="text-xs text-purple-400 font-medium tracking-widest">AI STUDIO</div>
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
        {subtitle && <p className="text-sm text-white/50 text-center mt-2">{subtitle}</p>}
      </div>

      {/* Card */}
      <div className="glass rounded-2xl p-8 shadow-2xl">
        {children}
      </div>
    </motion.div>
  </div>
);
