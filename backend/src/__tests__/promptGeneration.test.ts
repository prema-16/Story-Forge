import { MockTextProvider } from '../providers/text/MockTextProvider';
import { AIWriter } from '../agents/AIWriter';

describe('Prompt-Driven AI Generation Pipeline (Part 11 Tests)', () => {
  let mockProvider: MockTextProvider;
  let aiWriter: AIWriter;

  beforeEach(() => {
    mockProvider = new MockTextProvider();
    aiWriter = new AIWriter();
  });

  test('Test 1: Prompt "Create a documentary about Ancient Rome." generates Ancient Rome script', async () => {
    const prompt = 'Create a documentary about Ancient Rome.';
    const result = await mockProvider.generateJSON(
      `Write a complete 10-minute documentary video script. Topic/Idea: "${prompt}"`
    );

    const script = result.data as any;
    expect(script.title).toContain('Ancient Rome');
    expect(script.introduction).toContain('Ancient Rome');
    expect(script.chapters[0].title).toContain('Ancient Rome');
  });

  test('Test 2: Prompt "Explain Black Holes." generates Black Hole script', async () => {
    const prompt = 'Explain Black Holes.';
    const result = await mockProvider.generateJSON(
      `Write a complete 10-minute space video script. Topic/Idea: "${prompt}"`
    );

    const script = result.data as any;
    expect(script.title).toContain('Black Holes');
    expect(script.introduction).toContain('Black Holes');
    expect(script.chapters[0].title).toContain('Black Holes');
  });

  test('Test 3: Prompt "Create a Roblox horror story." generates Roblox horror script', async () => {
    const prompt = 'Create a Roblox horror story.';
    const result = await mockProvider.generateJSON(
      `Write a complete 10-minute gaming video script. Topic/Idea: "${prompt}"`
    );

    const script = result.data as any;
    expect(script.title).toContain('Roblox');
    expect(script.introduction).toContain('Roblox');
    expect(script.chapters[0].title).toContain('Roblox');
  });

  test('Test 4: Prompt "Top 10 AI tools in 2026." generates AI tools script', async () => {
    const prompt = 'Top 10 AI tools in 2026.';
    const result = await mockProvider.generateJSON(
      `Write a complete 10-minute technology video script. Topic/Idea: "${prompt}"`
    );

    const script = result.data as any;
    expect(script.title).toContain('Top 10 AI tools in 2026');
    expect(script.introduction).toContain('Top 10 AI tools in 2026');
    expect(script.chapters[0].title).toContain('Top 10 AI tools in 2026');
  });

  test('All 4 outputs are completely distinct and match their prompt topics', async () => {

    const prompts = [
      'Create a documentary about Ancient Rome.',
      'Explain Black Holes.',
      'Create a Roblox horror story.',
      'Top 10 AI tools in 2026.',
    ];

    const results = await Promise.all(
      prompts.map((p) =>
        mockProvider.generateJSON(`Write video script. Topic/Idea: "${p}"`)
      )
    );

    const titles = results.map((r: any) => r.data.title);

    // Verify all titles are distinct
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(4);

    // Verify each title contains its unique prompt keyword
    expect(titles[0]).toContain('Ancient Rome');
    expect(titles[1]).toContain('Black Holes');
    expect(titles[2]).toContain('Roblox');
    expect(titles[3]).toContain('Top 10 AI tools in 2026');
  });
});
