'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  type: string;
  message: string;
  timestamp: string;
  step?: string;
}

interface AIConsoleProps {
  logs: LogEntry[];
  isActive: boolean;
}

const TYPE_COLOR: Record<string, string> = {
  info: 'rgba(255,255,255,0.65)',
  success: '#34d399',
  error: '#f87171',
  warn: '#fbbf24',
  step_started: '#a78bfa',
  step_completed: '#34d399',
  step_failed: '#f87171',
  render_progress: '#06b6d4',
  render_completed: '#34d399',
};

const STEP_LABEL: Record<string, string> = {
  'generate-script': '[AIWriter]',
  'generate-scenes': '[AIScenePlanner]',
  'generate-prompts': '[AIPromptEngineer]',
  'generate-voice': '[AIVoiceDirector]',
  'generate-thumbnail': '[AIThumbnailDesigner]',
  'generate-seo': '[AISEOSpecialist]',
};

export function AIConsole({ logs, isActive }: AIConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour12: false });
    } catch {
      return '';
    }
  };

  return (
    <div className="ai-console">
      {/* Console header */}
      <div className="console-header">
        <div className="console-title">
          <Terminal className="h-3.5 w-3.5 text-purple-400" />
          <span>AI Console</span>
          {isActive && (
            <span className="console-live-badge">
              <span className="live-dot" />
              LIVE
            </span>
          )}
          <span className="log-count">{logs.length} entries</span>
        </div>
        <div className="console-actions">
          <button
            className="console-action-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            title="Toggle auto-scroll"
            style={{ color: autoScroll ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}
          >
            Auto-scroll
          </button>
          <button className="console-action-btn" onClick={handleCopy} title="Copy all logs">
            {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Log output */}
      <div
        className="console-output"
        onScroll={(e) => {
          const el = e.currentTarget;
          const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
          setAutoScroll(atBottom);
        }}
      >
        {logs.length === 0 ? (
          <div className="console-empty">
            <span className="cursor-blink">▊</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>
              Waiting for generation to start... Connect to a project and trigger a generation step.
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div
                key={`${log.timestamp}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
                className="log-line"
              >
                <span className="log-time">{formatTime(log.timestamp)}</span>
                {log.step && (
                  <span className="log-agent">
                    {STEP_LABEL[log.step] || `[${log.step}]`}
                  </span>
                )}
                <span style={{ color: TYPE_COLOR[log.type] || TYPE_COLOR.info }}>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      <style jsx>{`
        .ai-console {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #030308;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        }
        .console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          height: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .console-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          font-family: 'Inter', sans-serif;
        }
        .console-live-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 1px 6px;
          border-radius: 4px;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          color: #34d399;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .live-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #34d399;
          animation: pulse 1.2s infinite;
        }
        .log-count {
          color: rgba(255,255,255,0.2);
          font-size: 10px;
        }
        .console-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .console-action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          transition: color 0.15s;
        }
        .console-action-btn:hover { color: rgba(255,255,255,0.7); }
        .console-output {
          flex: 1;
          overflow-y: auto;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .console-output::-webkit-scrollbar { width: 4px; }
        .console-output::-webkit-scrollbar-track { background: transparent; }
        .console-output::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .console-empty {
          display: flex;
          align-items: center;
          font-size: 12px;
          padding: 4px 0;
        }
        .cursor-blink {
          color: #7c3aed;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .log-line {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 11px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .log-time {
          color: rgba(255,255,255,0.2);
          flex-shrink: 0;
          font-size: 10px;
        }
        .log-agent {
          color: #a78bfa;
          flex-shrink: 0;
          font-weight: 600;
        }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
      `}</style>
    </div>
  );
}
