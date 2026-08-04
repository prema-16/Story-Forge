import { logger } from '../config/logger';

export interface GoldenTestCase {
  id: string;
  name: string;
  prompt: string;
  expectedOutputContains: string[];
  expectedScore: { min: number; max: number };
  tags: string[];
  createdAt: string;
}

export interface RegressionResult {
  testCaseId: string;
  passed: boolean;
  actualScore: number;
  expectedMin: number;
  issues: string[];
  runAt: string;
}

export class GoldenDatasetManager {
  private testCases: GoldenTestCase[] = [
    {
      id: 'gc_001',
      name: 'YouTube Documentary Intro Script',
      prompt: 'Create a compelling 60-second intro for a documentary about quantum computing aimed at general audiences',
      expectedOutputContains: ['quantum', 'computing', 'future'],
      expectedScore: { min: 75, max: 100 },
      tags: ['script', 'documentary', 'intro'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gc_002',
      name: 'Viral Tech Thumbnail Description',
      prompt: 'Describe a thumbnail for a viral tech video about AI replacing jobs',
      expectedOutputContains: ['AI', 'jobs', 'technology'],
      expectedScore: { min: 70, max: 100 },
      tags: ['thumbnail', 'viral', 'tech'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gc_003',
      name: 'Brand Safety Content Review',
      prompt: 'Review this content for brand safety: [SAFE_CONTENT]',
      expectedOutputContains: ['safe', 'approved'],
      expectedScore: { min: 85, max: 100 },
      tags: ['safety', 'brand', 'review'],
      createdAt: new Date().toISOString(),
    },
  ];

  private regressionResults: RegressionResult[] = [];

  addTestCase(testCase: Omit<GoldenTestCase, 'id' | 'createdAt'>): GoldenTestCase {
    const tc: GoldenTestCase = {
      ...testCase,
      id: `gc_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.testCases.push(tc);
    logger.info(`[GoldenDatasetManager] Added golden test case: '${tc.name}' (${tc.id})`);
    return tc;
  }

  runRegressionTest(testCaseId: string, actualOutput: string, actualScore: number): RegressionResult {
    const tc = this.testCases.find((t) => t.id === testCaseId);
    if (!tc) throw new Error(`Test case ${testCaseId} not found`);

    const issues: string[] = [];
    const missingTerms = tc.expectedOutputContains.filter((term) => !actualOutput.toLowerCase().includes(term.toLowerCase()));
    if (missingTerms.length > 0) issues.push(`Missing expected terms: ${missingTerms.join(', ')}`);
    if (actualScore < tc.expectedScore.min) issues.push(`Score ${actualScore} below minimum ${tc.expectedScore.min}`);
    if (actualScore > tc.expectedScore.max) issues.push(`Score ${actualScore} above maximum ${tc.expectedScore.max}`);

    const result: RegressionResult = {
      testCaseId,
      passed: issues.length === 0,
      actualScore,
      expectedMin: tc.expectedScore.min,
      issues,
      runAt: new Date().toISOString(),
    };

    this.regressionResults.push(result);
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    logger.info(`[GoldenDatasetManager] Regression test '${tc.name}': ${status} (score: ${actualScore})`);
    return result;
  }

  getTestCases(): GoldenTestCase[] {
    return [...this.testCases];
  }

  getRegressionSummary(): { total: number; passed: number; failed: number; passRate: number } {
    const passed = this.regressionResults.filter((r) => r.passed).length;
    const total = this.regressionResults.length;
    return { total, passed, failed: total - passed, passRate: total ? Math.round((passed / total) * 100) : 100 };
  }
}

export const goldenDatasetManager = new GoldenDatasetManager();
