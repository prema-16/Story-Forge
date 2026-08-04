import { BaseAgent, AgentContext, AgentResult } from './base/BaseAgent';
import { agentRegistry } from './base/AgentRegistry';

export interface SceneOutput {
  sceneNumber: number;
  title: string;
  duration: number;
  narration: string;
  visualDescription: string;
  cameraMovement: string;
  soundEffects: string[];
  backgroundMusic: string;
  location: string;
  timeOfDay: string;
  mood: string;
  order: number;
}

/**
 * AIScenePlanner — breaks a script into individual scenes with full cinematic metadata.
 */
export class AIScenePlanner extends BaseAgent {
  readonly agentName = 'ai-scene-planner';
  readonly description = 'Splits script into scenes with timing, camera, and sound planning';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const { script, genre, style, videoLength } = payload as {
      script: { title: string; introduction: string; chapters: Array<{ title: string; content: string }>; ending: string };
      genre: string;
      style: string;
      videoLength: number;
    };

    const sceneCount = Math.max(6, Math.ceil(videoLength * 1.2));

    const systemPrompt = this.buildSystemPrompt(
      `You are a professional film director and scene planner.
You break scripts into detailed, filmable scenes.
Each scene must be visually distinct, have proper pacing, and include all technical details a director needs.
Genre: ${genre}. Style: ${style}.`,
      context.userMemory
    );

    const scriptText = `
Title: ${script.title}
Introduction: ${script.introduction}
${script.chapters.map((c, i) => `Chapter ${i + 1}: ${c.title}\n${c.content}`).join('\n\n')}
Ending: ${script.ending}
    `.trim();

    const prompt = `Break this ${videoLength}-minute ${genre} script into ${sceneCount} filmable scenes.

SCRIPT:
${scriptText}

For each scene return:
{
  "sceneNumber": number,
  "title": "Scene title",
  "duration": seconds (must sum to approximately ${videoLength * 60}),
  "narration": "exact voiceover narration text for this scene",
  "visualDescription": "detailed visual description for AI video generation",
  "cameraMovement": "Static | Pan | Tilt | Zoom | Dolly | Tracking | Aerial | Orbit | Handheld",
  "soundEffects": ["sound effect 1", "sound effect 2"],
  "backgroundMusic": "music description",
  "location": "setting description",
  "timeOfDay": "day | night | dusk | dawn | golden hour",
  "mood": "tense | dramatic | hopeful | mysterious | energetic | calm",
  "order": scene order number
}

Return JSON: { "scenes": [ ...sceneObjects ] }`;

    const provider = this.getTextProvider(context.preferredTextProvider);
    const result = await provider.generateJSON<{ scenes: SceneOutput[] }>(prompt, {
      systemPrompt,
      maxTokens: 8000,
      temperature: 0.7,
    });

    return {
      data: result.data as T,
      tokensUsed: result.meta.tokensUsed,
      provider: result.meta.provider,
      cost: result.meta.cost ?? 0,
    };
  }
}

export const aiScenePlanner = new AIScenePlanner();
agentRegistry.register(aiScenePlanner);
