import { Router, Response } from 'express';
import { crdtCollaborationServer } from '../collaboration/CRDTCollaborationServer';
import { presenceManager } from '../collaboration/PresenceManager';
import { threadCommentService } from '../collaboration/ThreadCommentService';
import { enterpriseWorkspaceManager } from '../enterprise/EnterpriseWorkspaceManager';
import { contentReviewPipeline } from '../enterprise/ContentReviewPipeline';
import { marketplaceService } from '../marketplace/MarketplaceService';
import { pluginSDKManager } from '../plugins/PluginSDKManager';
import { creatorIntelligenceEngine } from '../intelligence/CreatorIntelligenceEngine';
import { enterpriseBillingService } from '../billing/EnterpriseBillingService';
import { integrationAdapters } from '../developer/IntegrationAdapters';
import { notificationService } from '../notifications/NotificationService';
import { mobileCompanionService } from '../mobile/MobileCompanionService';
import { sendSuccess, sendError, asyncHandler } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

/* ==========================================================================
   1. CRDT & Collaboration Endpoints
   ========================================================================== */

router.post('/collaboration/op', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, projectId, clock, delta } = req.body;
  const userId = req.user!._id.toString();
  const result = crdtCollaborationServer.processOperation({ type, projectId, userId, clock, delta });
  sendSuccess(res, result);
}));

router.get('/collaboration/presence/:projectId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId as string;
  const presences = presenceManager.getRoomPresences(projectId);
  sendSuccess(res, { presences, activeCount: presences.length });
}));

router.post('/collaboration/comments', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId, timecodeSeconds, trackId, content, mentions } = req.body;
  const userId = req.user!._id.toString();
  const userName = req.user!.name || 'Collaborator';

  const thread = threadCommentService.createThread({
    projectId: projectId || 'demo-proj-1',
    authorId: userId,
    authorName: userName,
    timecodeSeconds,
    trackId,
    content: content || '',
    mentions: mentions || [],
  });
  sendSuccess(res, { thread });
}));

router.get('/collaboration/comments/:projectId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId as string;
  const threads = threadCommentService.getProjectThreads(projectId);
  sendSuccess(res, { threads });
}));

router.patch('/collaboration/comments/:threadId/resolve', asyncHandler(async (req: AuthRequest, res: Response) => {
  const threadId = req.params.threadId as string;
  const { resolved } = req.body;
  const success = threadCommentService.resolveThread(threadId, resolved !== false);
  if (!success) return sendError(res, 'Thread not found', 404);
  sendSuccess(res, { message: 'Thread status updated', resolved: resolved !== false });
}));

/* ==========================================================================
   2. Workspaces & Governance Endpoints
   ========================================================================== */

router.get('/workspaces', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const workspaces = enterpriseWorkspaceManager.getWorkspaces();
  const departments = enterpriseWorkspaceManager.getDepartments();
  sendSuccess(res, { workspaces, departments });
}));

router.post('/workspaces', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, name, organizationId, departmentId, quotaStorageGb, quotaRendersPerMonth } = req.body;
  enterpriseWorkspaceManager.createWorkspace({
    id: id || `ws_${Date.now()}`,
    name,
    organizationId: organizationId || 'org_enterprise_1',
    departmentId: departmentId || 'dept_marketing',
    quotaStorageGb: quotaStorageGb || 1000,
    quotaRendersPerMonth: quotaRendersPerMonth || 500,
    membersCount: 1,
  });
  sendSuccess(res, { message: 'Workspace created successfully' });
}));

router.post('/workspaces/consume-quota', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { workspaceId, rendersCount } = req.body;
  const result = enterpriseWorkspaceManager.consumeRenderQuota(workspaceId, rendersCount || 1);
  if (!result.success) return sendError(res, 'Render quota exceeded for workspace', 400);
  sendSuccess(res, result);
}));

/* ==========================================================================
   3. Content Review Pipeline Endpoints
   ========================================================================== */

router.post('/review', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId, gates } = req.body;
  const reviews = contentReviewPipeline.submitForReview(projectId || 'demo-proj-1', gates);
  sendSuccess(res, { reviews });
}));

router.get('/review/:projectId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId as string;
  const reviews = contentReviewPipeline.getReviewStatus(projectId);
  const fullyApproved = contentReviewPipeline.isFullyApproved(projectId);
  sendSuccess(res, { reviews, fullyApproved });
}));

router.patch('/review/:projectId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId as string;
  const { gate, status, notes } = req.body;
  const reviewerId = req.user!._id.toString();

  const success = contentReviewPipeline.updateReviewStatus(projectId, gate, status, reviewerId, notes);
  if (!success) return sendError(res, 'Review request not found', 404);
  sendSuccess(res, { message: `Gate '${gate}' updated to '${status}'` });
}));

/* ==========================================================================
   4. Marketplace Endpoints
   ========================================================================== */

router.get('/marketplace', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category, search } = req.query;
  let assets = marketplaceService.listAssets(category as any);
  if (search) {
    assets = marketplaceService.searchAssets(search as string);
  }
  sendSuccess(res, { assets });
}));

router.post('/marketplace/buy', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { assetId } = req.body;
  const result = marketplaceService.purchaseAsset(assetId);
  if (!result.success) return sendError(res, 'Marketplace asset not found', 404);
  sendSuccess(res, { message: 'Asset purchased successfully', asset: result.asset });
}));

/* ==========================================================================
   5. Plugin SDK Sandbox Endpoints
   ========================================================================== */

router.get('/plugins', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const plugins = pluginSDKManager.listPlugins();
  sendSuccess(res, { plugins });
}));

router.patch('/plugins/:id/status', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const success = pluginSDKManager.setPluginStatus(id, status);
  if (!success) return sendError(res, 'Plugin not found', 404);
  sendSuccess(res, { message: `Plugin status updated to '${status}'` });
}));

/* ==========================================================================
   6. Creator Intelligence & Billing Endpoints
   ========================================================================== */

router.get('/intelligence', asyncHandler(async (req: AuthRequest, res: Response) => {
  const channelId = (req.query.channelId as string) || 'channel_official';
  const intelligence = creatorIntelligenceEngine.getChannelIntelligence(channelId);
  sendSuccess(res, { intelligence });
}));

router.post('/intelligence/seo', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, category } = req.body;
  const seo = creatorIntelligenceEngine.generateSEORecommendations(title || 'Untitled', category || 'General');
  sendSuccess(res, { seo });
}));

router.get('/billing', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const subscription = enterpriseBillingService.getSubscription('org_enterprise_1');
  sendSuccess(res, { subscription });
}));

router.post('/billing/consume-credits', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  const result = enterpriseBillingService.consumeCredits('org_enterprise_1', amount || 10);
  if (!result.success) return sendError(res, 'Insufficient credits remaining', 400);
  sendSuccess(res, result);
}));

/* ==========================================================================
   7. Integrations, Notifications & Mobile Companion Endpoints
   ========================================================================== */

router.get('/integrations', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const integrations = integrationAdapters.listConnections();
  sendSuccess(res, { integrations });
}));

router.post('/integrations/connect', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { service, accountEmail } = req.body;
  const connection = integrationAdapters.connectService(service, accountEmail);
  sendSuccess(res, { connection });
}));

router.get('/notifications', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const notifications = notificationService.getUserNotifications(userId);
  sendSuccess(res, { notifications });
}));

router.patch('/notifications/:id/read', asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const success = notificationService.markAsRead(id);
  if (!success) return sendError(res, 'Notification not found', 404);
  sendSuccess(res, { message: 'Notification marked as read' });
}));

router.get('/mobile-summary', asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = mobileCompanionService.getMobileSummary(req.user!._id.toString());
  sendSuccess(res, { summary });
}));

router.post('/mobile-approve', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId, gate } = req.body;
  const userId = req.user!._id.toString();
  const success = mobileCompanionService.approveReviewFromMobile(projectId, gate, userId);
  if (!success) return sendError(res, 'Failed to process mobile approval', 400);
  sendSuccess(res, { message: `Approved gate '${gate}' for project '${projectId}' via Mobile Companion` });
}));

export default router;
