'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const quickChips = ['Rewrite current scene', 'Improve visual prompt', 'Suggest SEO tags', 'Recommend thumbnail concept'];

export const ChatWidget = () => {
  const { messages, isOpen, isTyping, projectContext, toggle, sendMessage } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    await sendMessage(txt);
  };

  const handleChipClick = (chip: string) => {
    sendMessage(chip);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white shadow-2xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all"
        title="AI Copilot Chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[520px] rounded-3xl border border-white/10 bg-[#0a0a20]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-purple-900/20">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Director Assistant</h4>
                  <p className="text-[10px] text-purple-300">
                    {projectContext ? `Context: ${projectContext.title}` : 'Ready to help'}
                  </p>
                </div>
              </div>
              <button onClick={toggle} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <Sparkles className="h-8 w-8 text-purple-400 mx-auto" />
                  <p className="text-xs text-white/50 max-w-xs mx-auto">
                    Ask me to rewrite scenes, optimize AI prompts, or generate YouTube titles for your project.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                        m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                      }`}
                    >
                      {m.isLoading ? (
                        <span className="flex items-center gap-1.5 text-white/50">
                          <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                        </span>
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-3 py-2 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 border border-white/10 whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI Director..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
