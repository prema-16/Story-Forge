'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { FullPageSpinner } from '../ui/spinner';
import { ChatWidget } from '../chat/chat-widget';
import { CommandPalette, useCommandPalette } from '../ui/command-palette';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AppLayout = ({ children, title, subtitle }: AppLayoutProps) => {
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const { sidebarCollapsed } = useSettingsStore();
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMe().then(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        router.replace('/login');
      }
    });
  }, []);

  if (isLoading && !isAuthenticated) return <FullPageSpinner />;
  if (!isAuthenticated) return <FullPageSpinner />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#05050f]">
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 72 : 260) }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-1 flex-col min-w-0 overflow-hidden"
      >
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
      <ChatWidget />
      {/* Global Command Palette */}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </div>
  );
};
