'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell, Command, Zap, Search, ChevronDown, User,
  Settings, LogOut, CreditCard, Menu,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCommandPalette } from '../ui/command-palette';
import { Avatar } from '../ui/avatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useSettingsStore();
  const router = useRouter();
  const { open: openPalette } = useCommandPalette();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const creditPercent = user
    ? Math.round((user.credits / Math.max((user as any).creditsTotal || 1000, 1)) * 100)
    : 0;

  return (
    <header className="app-header">
      {/* Left: Title + Mobile Menu */}
      <div className="header-left">
        <button
          onClick={toggleSidebar}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white"
          title="Toggle Navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h2 className="header-title truncate">{title}</h2>
          {subtitle && <p className="header-subtitle truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Center: Command Palette trigger */}
      <button className="palette-trigger" onClick={openPalette}>
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Search anything...</span>
        <kbd className="palette-kbd">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Right: Credits + Notifications + User */}
      <div className="header-right">
        {/* Credits pill */}
        <div className="credits-pill" title={`${user?.credits} credits remaining`}>
          <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
          <span className="credits-count">{user?.credits ?? 0}</span>
          <div className="credits-bar-track">
            <div
              className="credits-bar-fill"
              style={{ width: `${Math.min(creditPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Notifications */}
        <button className="icon-btn-header" title="Notifications">
          <Bell className="h-4 w-4" />
          <span className="notif-dot" />
        </button>

        {/* User menu */}
        <div className="user-menu-wrapper" ref={menuRef}>
          <button
            className="user-trigger"
            onClick={() => setUserMenuOpen(v => !v)}
          >
            <Avatar name={user?.name || 'U'} size="sm" />
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
            <ChevronDown className={`h-3.5 w-3.5 user-chevron ${userMenuOpen ? 'open' : ''}`} />
          </button>

          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="user-dropdown"
            >
              {/* Profile info */}
              <div className="user-dropdown-header">
                <Avatar name={user?.name || 'U'} size="md" />
                <div>
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                  <span className="dropdown-plan">{user?.plan || 'free'}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              {[
                { label: 'Settings', icon: Settings, href: '/settings' },
                { label: 'Billing', icon: CreditCard, href: '/billing' },
              ].map(({ label, icon: Icon, href }) => (
                <button
                  key={label}
                  className="dropdown-item"
                  onClick={() => { router.push(href); setUserMenuOpen(false); }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}

              <div className="dropdown-divider" />

              <button
                className="dropdown-item danger"
                onClick={() => { logout(); router.push('/login'); }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .app-header {
          display: flex; align-items: center; justify-content: space-between;
          height: 56px; padding: 0 20px;
          background: rgba(5,5,15,0.85);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 50;
          gap: 16px;
          flex-shrink: 0;
        }
        .header-left { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
        .header-title { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.02em; font-family: 'Space Grotesk', sans-serif; }
        .header-subtitle { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }

        .palette-trigger {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(255,255,255,0.3); font-size: 12px;
          cursor: pointer; transition: all 0.15s;
          white-space: nowrap;
          min-width: 180px;
        }
        .palette-trigger:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); }
        .palette-kbd {
          display: flex; align-items: center; gap: 1px;
          margin-left: auto;
          padding: 2px 5px; border-radius: 4px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 10px; font-family: monospace;
          color: rgba(255,255,255,0.3);
        }

        .header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .credits-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.15);
          border-radius: 20px;
        }
        .credits-count { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); }
        .credits-bar-track { width: 40px; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .credits-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444); border-radius: 2px; transition: width 0.4s ease; }

        .icon-btn-header {
          position: relative;
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.15s;
        }
        .icon-btn-header:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .notif-dot {
          position: absolute; top: 6px; right: 7px;
          width: 6px; height: 6px; border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 6px rgba(239,68,68,0.6);
        }

        .user-menu-wrapper { position: relative; }
        .user-trigger {
          display: flex; align-items: center; gap: 7px;
          padding: 4px 10px 4px 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          cursor: pointer; transition: all 0.15s;
        }
        .user-trigger:hover { background: rgba(255,255,255,0.08); }
        .user-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .user-chevron { color: rgba(255,255,255,0.3); transition: transform 0.2s; }
        .user-chevron.open { transform: rotate(180deg); }

        .user-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 240px;
          background: rgba(12,12,28,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7);
          overflow: hidden;
          z-index: 200;
        }
        .user-dropdown-header { display: flex; align-items: center; gap: 10px; padding: 14px 14px 12px; }
        .dropdown-name { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9); }
        .dropdown-email { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }
        .dropdown-plan { display: inline-block; margin-top: 4px; padding: 1px 6px; border-radius: 4px; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3); font-size: 9px; font-weight: 700; text-transform: uppercase; color: #a78bfa; letter-spacing: 0.06em; }
        .dropdown-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 14px;
          background: transparent; border: none;
          color: rgba(255,255,255,0.65); font-size: 13px;
          cursor: pointer; transition: all 0.12s; text-align: left;
          font-family: 'Inter', sans-serif;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .dropdown-item.danger { color: rgba(239,68,68,0.8); }
        .dropdown-item.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }

        @media (max-width: 640px) {
          .app-header { padding: 0 10px; gap: 8px; }
          .header-title { font-size: 14px; }
          .header-subtitle { display: none; }
          .palette-trigger { min-width: auto; padding: 7px; }
          .palette-trigger span, .palette-kbd { display: none; }
          .user-name { display: none; }
          .credits-bar-track { display: none; }
          .header-right { gap: 4px; }
        }
      `}</style>
    </header>
  );
};
