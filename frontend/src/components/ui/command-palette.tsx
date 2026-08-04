'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Command, ArrowRight, Hash, FileText, LayoutDashboard,
  Settings, BarChart2, Plus, Mic, LogOut, Sun, Moon, Video,
  Sparkles, HelpCircle, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dash', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), group: 'Navigation' },
    { id: 'nav-projects', label: 'Go to Projects', icon: FileText, action: () => navigate('/projects'), group: 'Navigation' },
    { id: 'nav-analytics', label: 'Go to Analytics', icon: BarChart2, action: () => navigate('/analytics'), group: 'Navigation' },
    { id: 'nav-settings', label: 'Open Settings', icon: Settings, action: () => navigate('/settings'), group: 'Navigation' },
    { id: 'nav-billing', label: 'Open Billing', icon: Hash, action: () => navigate('/billing'), group: 'Navigation' },
    { id: 'nav-chat', label: 'Open AI Assistant', icon: Sparkles, action: () => navigate('/ai-chat'), group: 'Navigation', keywords: ['copilot', 'ai', 'chat', 'assistant'] },

    // Actions
    { id: 'act-new', label: 'New Project', description: 'Start creating a new video', icon: Plus, action: () => navigate('/projects/new'), group: 'Actions', keywords: ['create', 'start', 'begin'] },
    { id: 'act-voice', label: 'Browse Voices', description: 'Explore available narrator voices', icon: Mic, action: () => navigate('/settings?tab=voices'), group: 'Actions' },

    // Account
    { id: 'acc-logout', label: 'Sign Out', description: 'Log out of your account', icon: LogOut, action: () => { logout(); onClose(); router.push('/login'); }, group: 'Account' },
    { id: 'acc-help', label: 'Help & Documentation', icon: HelpCircle, action: () => window.open('https://docs.storyforge.ai', '_blank'), group: 'Account' },
  ];

  const filtered = query.trim()
    ? commands.filter(cmd => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.group.toLowerCase().includes(q) ||
          cmd.keywords?.some(k => k.includes(q))
        );
      })
    : commands;

  const groups = Array.from(new Set(filtered.map(c => c.group)));

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter' && filtered[selected]) {
        filtered[selected].action();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, filtered, selected, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  let itemIdx = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: '14vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 560,
              maxWidth: '95vw',
              zIndex: 501,
              background: 'rgba(10,10,26,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Search input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Search className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search commands, pages, actions..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 14, fontFamily: 'Inter, sans-serif',
                }}
              />
              <kbd style={{
                padding: '2px 6px', borderRadius: 5,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 10, color: 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace',
              }}>ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} style={{ maxHeight: 360, overflowY: 'auto', padding: '6px 0' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  No results for "<strong>{query}</strong>"
                </div>
              ) : (
                groups.map(group => {
                  const groupItems = filtered.filter(c => c.group === group);
                  return (
                    <div key={group}>
                      <div style={{
                        padding: '6px 16px 4px',
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                      }}>
                        {group}
                      </div>
                      {groupItems.map(item => {
                        const idx = itemIdx++;
                        const isSelected = idx === selected;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            data-index={idx}
                            onClick={item.action}
                            onMouseEnter={() => setSelected(idx)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              width: '100%', padding: '8px 16px',
                              background: isSelected ? 'rgba(124,58,237,0.15)' : 'transparent',
                              border: 'none', cursor: 'pointer',
                              transition: 'background 0.1s',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: isSelected ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Icon className="h-4 w-4" style={{ color: isSelected ? '#a78bfa' : 'rgba(255,255,255,0.4)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif' }}>
                                {item.label}
                              </p>
                              {item.description && (
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {isSelected && <ChevronRight className="h-3.5 w-3.5" style={{ color: '#a78bfa' }} />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: 10, color: 'rgba(255,255,255,0.2)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>↑↓</kbd>
                navigate
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>↵</kbd>
                select
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Command className="h-3 w-3" />K — StoryForge AI
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to open the command palette via ⌘K / Ctrl+K
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(v => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
