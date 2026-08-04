import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  projectContext: { id: string; title: string } | null;

  setOpen: (v: boolean) => void;
  toggle: () => void;
  setProjectContext: (ctx: { id: string; title: string } | null) => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setTyping: (v: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: "I'm your StoryForge AI assistant! I can help you rewrite scenes, improve prompts, generate SEO metadata, and more. What would you like to work on?",
  rewrite: "I've analyzed your scene. Here's a rewritten version with better pacing and more vivid imagery. The narration now flows more naturally with the visual description.",
  improve: "Great choice! I've improved the prompt by adding more cinematic details — golden hour lighting, shallow depth of field, and a slow dolly push to create emotional depth.",
  seo: "Your SEO looks strong! I'd suggest tweaking the title to include your primary keyword in the first 50 characters, and adding 3-5 trending hashtags in your niche.",
  thumbnail: "For maximum click-through rate, I recommend a bold contrasting text overlay, a strong emotional face or dramatic scene, and a color scheme that pops against YouTube's white background.",
};

function parseDirectorPrompt(content: string) {
  const lower = content.toLowerCase();
  const isCreate = lower.includes('create') || lower.includes('generate') || lower.includes('make') || lower.includes('build');
  
  if (!isCreate) return null;

  // Extract parameters or fall back to intelligent defaults
  let duration = 30;
  if (lower.includes('15-second') || lower.includes('15s') || lower.includes('15 sec')) duration = 15;
  if (lower.includes('60-second') || lower.includes('60s') || lower.includes('60 sec')) duration = 60;
  if (lower.includes('90-second') || lower.includes('90s') || lower.includes('90 sec')) duration = 90;

  const platform = lower.includes('tiktok') ? 'TikTok' : lower.includes('reels') ? 'Instagram Reels' : 'YouTube Shorts';
  const style = lower.includes('anime') ? 'Anime' : lower.includes('cyberpunk') ? 'Cyberpunk' : 'Cinematic Photorealistic';

  return { duration, platform, style };
}

function getDirectorResponse(content: string): string {
  const parsed = parseDirectorPrompt(content);
  if (parsed) {
    return `🎬 **AI Director Master Plan Initialized**
    
**Target:** ${parsed.duration}s ${parsed.platform} (${parsed.style})
**Topic Parsed:** "${content.slice(0, 80)}..."

⚡ **Executing 10-Agent Swarm Pipeline:**

1. 📂 **Project Setup:** Created workspace project & initialized 9:16 canvas.
2. ✍️ **AI Writer (GPT-4o):** Researched topic & drafted 4-act high-hook script.
3. 🎨 **Prompt Engineer:** Generated 4 photorealistic SDXL cinematic scene prompts.
4. 🎙️ **Voice Director (ElevenLabs):** Synthesized dramatic narrator voice track (140 wpm).
5. 🎵 **Audio Mixer:** Generated epic cinematic background score & auto-ducking.
6. 📽️ **Video Engine (Runway Gen-3):** Rendered 4 scene clips with motion blur.
7. 📝 **Subtitle Engine:** Burned kinetic Marvel-style auto-captions.
8. 🖼️ **Thumbnail Designer:** Rendered 3 high-CTR 9:16 cover options.
9. 🏷️ **SEO Specialist:** Generated title, description & 15 viral hashtags.
10. 📊 **Virality Prediction:** Score **94/100** | Estimated Retention **82% at 30s**.

✨ *Project is ready in your Studio Editor & AI Shorts Studio for 1-click publishing!*`;
  }

  const lower = content.toLowerCase();
  if (lower.includes('rewrite') || lower.includes('scene')) return MOCK_RESPONSES.rewrite;
  if (lower.includes('improve') || lower.includes('prompt')) return MOCK_RESPONSES.improve;
  if (lower.includes('seo') || lower.includes('title') || lower.includes('tag')) return MOCK_RESPONSES.seo;
  if (lower.includes('thumbnail') || lower.includes('click')) return MOCK_RESPONSES.thumbnail;
  return MOCK_RESPONSES.default;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isOpen: false,
  isTyping: false,
  projectContext: null,

  setOpen: (v) => set({ isOpen: v }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setProjectContext: (ctx) => set({ projectContext: ctx }),

  addMessage: (msg) => {
    const id = crypto.randomUUID();
    set((s) => ({
      messages: [...s.messages, { ...msg, id, timestamp: new Date() }],
    }));
    return id;
  },

  updateMessage: (id, updates) => {
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  setTyping: (v) => set({ isTyping: v }),

  sendMessage: async (content) => {
    const { addMessage, updateMessage, setTyping, projectContext } = get();

    // Add user message
    addMessage({ role: 'user', content });

    // Add loading assistant message
    setTyping(true);
    const loadingId = addMessage({ role: 'assistant', content: '', isLoading: true });

    // Simulate AI Director agent thinking & orchestration delay
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 600));

    const context = projectContext ? `\n\n*(Working in context of: "${projectContext.title}")*` : '';
    const response = getDirectorResponse(content) + context;

    updateMessage(loadingId, { content: response, isLoading: false });
    setTyping(false);
  },

  clearMessages: () => set({ messages: [] }),
}));
