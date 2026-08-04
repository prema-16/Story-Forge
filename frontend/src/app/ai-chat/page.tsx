'use client';
import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '../../components/layout/app-layout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useChatStore } from '../../store/chatStore';
import { Bot, User, Send, Sparkles, Loader2, RotateCcw } from 'lucide-react';

const quickChips = [
  'Create a 30-second Spider-Man Brand New Day trailer using realistic visuals, dramatic narration, epic music, Marvel-style captions, and publish to YouTube Shorts.',
  'Generate a 60-second Cyberpunk AI documentary with ElevenLabs voice and SDXL visuals',
  'What is the best thumbnail composition for high CTR on YouTube Shorts?',
  'Explain how AI Director orchestrates 10 specialized agents',
];

export default function AIChatPage() {
  const { messages, isTyping, sendMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    await sendMessage(txt);
  };

  return (
    <AppLayout title="AI Director Copilot" subtitle="Full-screen AI Assistant powered by multi-agent director logic">
      <div className="h-[calc(100vh-64px-48px)] flex flex-col max-w-4xl mx-auto rounded-3xl border border-white/10 bg-[#07071a]/90 backdrop-blur-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                StoryForge AI Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  ⚡ 24 Multi-Modal Sources Active
                </span>
              </h3>
              <p className="text-xs text-purple-300">Context-Aware Autonomous Director Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg shadow-amber-500/20 flex items-center gap-1.5 hover:opacity-90 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-200" /> ⚡ 1-Click Autonomous Mode: ON
            </button>
            <Button variant="ghost" size="sm" onClick={clearMessages} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
              Clear Chat
            </Button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">How can I assist your video creation?</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Ask anything about scriptwriting, visual prompt engineering, ElevenLabs voice synthesis, or YouTube SEO optimization.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto pt-4">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(chip)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 text-xs text-white/70 hover:text-purple-300 text-left transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                    m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-sm max-w-[80%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                  }`}
                >
                  {m.isLoading ? (
                    <span className="flex items-center gap-2 text-white/50">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> AI Director thinking...
                    </span>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex items-center gap-3 bg-[#0a0a22]">
          <Input
            placeholder="Type your instruction or prompt question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-11"
          />
          <Button type="submit" variant="primary" size="md" disabled={!input.trim()} rightIcon={<Send className="h-4 w-4" />}>
            Send
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
