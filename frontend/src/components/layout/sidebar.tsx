'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  LayoutTemplate,
  BarChart3,
  BookOpen,
  MessageSquare,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  ShieldAlert,
  Cpu,
  Zap,
  Server,
  ShoppingBag,
  Video,
  Film,
  Code,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Avatar } from '../ui/avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Shorts Studio', href: '/shorts-studio', icon: Film, badge: 'NEW' },
  { label: 'Enterprise Hub', href: '/enterprise', icon: Building2, badge: 'ENTERPRISE' },
  { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { label: 'Production Hub', href: '/production-hub', icon: Server, badge: 'PRO' },
  { label: 'AI Control Center', href: '/ai-control-center', icon: Cpu, badge: 'AIOS' },
  { label: 'Developer Portal', href: '/developer', icon: Code },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Organization', href: '/organization', icon: Building2 },
  { label: 'Templates', href: '/templates', icon: LayoutTemplate },
  { label: 'Prompt Library', href: '/prompt-library', icon: BookOpen },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'AI Chat', href: '/ai-chat', icon: MessageSquare, badge: 'NEW' },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Admin Logs', href: '/admin/audit-logs', icon: ShieldAlert, adminOnly: true },
  { label: 'System Health', href: '/admin/system-health', icon: Server, adminOnly: true },
  { label: 'Queue Dashboard', href: '/admin/queues', icon: Cpu, adminOnly: true },
  { label: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin' || user?.role === 'superadmin'
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? 260 : (sidebarCollapsed ? 72 : 260),
          x: isMobile && sidebarCollapsed ? -260 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen z-40 flex flex-col glass-apple border-r border-white/[0.08] overflow-hidden"
      >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 shadow-lg shadow-purple-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <span className="font-display font-bold text-white text-sm leading-tight block">
                  StoryForge
                </span>
                <span className="text-[10px] text-purple-400 font-medium tracking-wide">AI STUDIO</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer',
                  active
                    ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]',
                  sidebarCollapsed && 'justify-center'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-400 rounded-r-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-purple-400' : '')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!sidebarCollapsed && item.badge && (
                  <span className="ml-auto text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Credits bar */}
      <AnimatePresence>
        {!sidebarCollapsed && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium text-white/60">Credits</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{user.credits.toLocaleString()}</span>
              <span className="text-xs text-white/30">remaining</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                style={{ width: `${Math.min(100, (user.credits / (user.credits + user.creditsUsed)) * 100)}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User + Logout */}
      <div className="border-t border-white/[0.06] p-2 flex-shrink-0">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-2 hover:bg-white/[0.04] transition-colors cursor-pointer',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <Avatar src={user?.avatar} name={user?.name} size="sm" className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
                <p className="text-xs text-white/40 truncate capitalize">{user?.plan ?? 'free'} plan</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button
              onClick={() => logout()}
              className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'mt-1 w-full flex items-center justify-center gap-2 rounded-xl py-2 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors text-xs',
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};
