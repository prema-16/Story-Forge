import { Router, Request, Response } from 'express';
import { providerRegistry } from '../aios/providers/ProviderRegistry';
import { agentRegistryV2 } from '../aios/agents/AgentRegistryV2';
import { dagRunner } from '../aios/workflow/DAGRunner';
import { YOUTUBE_SHORTS_TEMPLATE, DOCUMENTARY_TEMPLATE } from '../aios/workflow/WorkflowTemplates';
import { benchmarkEngine, smartCache, aiSandbox } from '../aios/extras/AIOSExtras';
import { costEngine } from '../aios/cost/CostEngine';
import { sendSuccess, asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /aios/providers:
 *   get:
 *     summary: Get all registered AI providers, health metrics, and circuit breaker states
 *     tags: [AIOS]
 */
router.get('/providers', asyncHandler(async (_req: Request, res: Response) => {
  const providers = providerRegistry.list().map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    models: p.supportedModels,
    capabilities: p.capabilities,
  }));
  const metrics = providerRegistry.getMetrics();
  sendSuccess(res, { providers, metrics });
}));

/**
 * @openapi
 * /aios/agents:
 *   get:
 *     summary: List all 19 specialized AI agents registered in AIOS
 *     tags: [AIOS]
 */
router.get('/agents', asyncHandler(async (_req: Request, res: Response) => {
  const agents = agentRegistryV2.list().map((a) => ({
    id: a.agentId,
    name: a.name,
    description: a.description,
    defaultCredits: a.defaultCredits,
  }));
  sendSuccess(res, { agents });
}));

/**
 * @openapi
 * /aios/workflows/templates:
 *   get:
 *     summary: Get pre-built DAG workflow graph templates
 *     tags: [AIOS]
 */
router.get('/workflows/templates', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, { templates: [YOUTUBE_SHORTS_TEMPLATE, DOCUMENTARY_TEMPLATE] });
}));

/**
 * @openapi
 * /aios/benchmark:
 *   get:
 *     summary: Run real-time AI benchmark across OpenAI, Claude, Gemini, Groq, DeepSeek
 *     tags: [AIOS]
 */
router.get('/benchmark', asyncHandler(async (_req: Request, res: Response) => {
  const results = await benchmarkEngine.benchmarkAll();
  sendSuccess(res, { benchmark: results });
}));

/**
 * @openapi
 * /aios/sandbox:
 *   post:
 *     summary: Test run prompt in AI Sandbox
 *     tags: [AIOS]
 */
router.post('/sandbox', asyncHandler(async (req: Request, res: Response) => {
  const { prompt, providerId } = req.body;
  const result = await aiSandbox.testRunPrompt(prompt || 'Test prompt', providerId || 'openai');
  sendSuccess(res, result);
}));

export default router;
