import { BaseAgent, AgentContext, AgentResult } from './base/BaseAgent';
import { agentRegistry } from './base/AgentRegistry';

export interface ScriptOutput {
  title: string;
  introduction: string;
  chapters: Array<{
    number: number;
    title: string;
    content: string;
    duration: number;
    wordCount: number;
  }>;
  ending: string;
  outro: string;
  totalWordCount: number;
  estimatedDuration: number;
  tone: string;
}

/**
 * AIWriter — generates the full story script.
 * Handles: story creation, script writing, narration, dialogue, and summaries.
 */
export class AIWriter extends BaseAgent {
  readonly agentName = 'ai-writer';
  readonly description = 'Generates story, script, narration, and dialogue';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const {
      idea,
      genre = 'documentary',
      videoLength = 10,
      style = 'cinematic',
      language = 'en',
      tone = 'informative',
    } = payload as {
      idea: string;
      genre: string;
      videoLength: number;
      style: string;
      language: string;
      tone: string;
    };

    const wordTarget = videoLength * 150; // ~150 words/minute narration
    const chapterCount = Math.max(2, Math.floor(videoLength / 2));

    const systemPrompt = this.buildSystemPrompt(
      `You are an expert documentary scriptwriter and storyteller.
You write compelling, factual narratives for YouTube documentaries.
Your scripts are structured with clear chapters, vivid narration, and emotional hooks.
Always write in ${language} language.
Style: ${style}. Genre: ${genre}.`,
      context.userMemory
    );

    const prompt = `Write a complete ${videoLength}-minute ${genre} video script for YouTube.

Topic/Idea: "${idea}"

Requirements:
- Total word count: approximately ${wordTarget} words
- Exactly ${chapterCount} chapters
- Tone: ${tone}
- Style: ${style}
- Language: ${language}

Return a JSON object with this exact structure:
{
  "title": "engaging YouTube title",
  "introduction": "hook + overview paragraph (50-80 words)",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "content": "full chapter narration text",
      "duration": 120,
      "wordCount": 300
    }
  ],
  "ending": "conclusion paragraph",
  "outro": "call to action for YouTube",
  "totalWordCount": ${wordTarget},
  "estimatedDuration": ${videoLength * 60},
  "tone": "${tone}"
}`;

    const provider = this.getTextProvider(context.preferredTextProvider);
    const result = await provider.generateJSON<ScriptOutput>(prompt, {
      systemPrompt,
      maxTokens: 6000,
      temperature: 0.75,
    });

    return {
      data: result.data as T,
      tokensUsed: result.meta.tokensUsed,
      provider: result.meta.provider,
      cost: result.meta.cost ?? 0,
    };
  }
}

export const aiWriter = new AIWriter();
agentRegistry.register(aiWriter);
