import { BaseAgent, AgentContext, AgentResult } from './base/BaseAgent';
import { agentRegistry } from './base/AgentRegistry';

export interface CinematicPromptOutput {
  environment: string;
  characters: string;
  lighting: string;
  camera: string;
  lens: string;
  mood: string;
  action: string;
  colorGrading: string;
  resolution: string;
  negativePrompts: string;
  fullPrompt: string;
  type: 'image' | 'video';
}

/**
 * AIPromptEngineer — generates professional cinematic AI prompts for each scene.
 * Outputs prompts ready for Runway, DALL·E, Stability AI, etc.
 */
export class AIPromptEngineer extends BaseAgent {
  readonly agentName = 'ai-prompt-engineer';
  readonly description = 'Generates professional cinematic AI prompts for images and video';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const { scene, genre, style, aspectRatio } = payload as {
      scene: {
        sceneNumber: number;
        title: string;
        visualDescription: string;
        cameraMovement: string;
        mood: string;
        location: string;
        timeOfDay: string;
      };
      genre: string;
      style: string;
      aspectRatio: string;
    };

    const systemPrompt = this.buildSystemPrompt(
      `You are a world-class AI prompt engineer specializing in cinematic video generation.
You create highly detailed prompts that produce stunning, professional-quality visuals.
Your prompts are optimized for: Runway ML, Kling AI, DALL·E 3, and Stable Diffusion.
Always prioritize: cinematic quality, visual storytelling, and technical precision.`,
      context.userMemory
    );

    const prompt = `Generate a professional cinematic AI prompt for this scene:

Scene ${scene.sceneNumber}: ${scene.title}
Visual Description: ${scene.visualDescription}
Camera Movement: ${scene.cameraMovement}
Mood: ${scene.mood}
Location: ${scene.location}
Time of Day: ${scene.timeOfDay}
Genre: ${genre}
Style: ${style}
Aspect Ratio: ${aspectRatio}

Return JSON with this structure:
{
  "environment": "detailed environment/setting description",
  "characters": "character descriptions (or 'no characters visible' if absent)",
  "lighting": "specific lighting setup (e.g., 'golden hour backlight, volumetric fog')",
  "camera": "camera angle and movement (e.g., 'low angle slow dolly forward')",
  "lens": "lens specification (e.g., '35mm anamorphic, shallow depth of field')",
  "mood": "atmospheric mood description",
  "action": "specific visual action or motion happening in the frame",
  "colorGrading": "color grade description (e.g., 'teal and orange, high contrast, film grain')",
  "resolution": "8K ultra HD, photorealistic",
  "negativePrompts": "blurry, cartoon, anime, text, watermark, low quality, distorted",
  "fullPrompt": "complete optimized prompt string combining all elements",
  "type": "video"
}`;

    const provider = this.getTextProvider(context.preferredTextProvider);
    const result = await provider.generateJSON<CinematicPromptOutput>(prompt, {
      systemPrompt,
      maxTokens: 1500,
      temperature: 0.8,
    });

    return {
      data: result.data as T,
      tokensUsed: result.meta.tokensUsed,
      provider: result.meta.provider,
      cost: result.meta.cost ?? 0,
    };
  }
}

export const aiPromptEngineer = new AIPromptEngineer();
agentRegistry.register(aiPromptEngineer);
