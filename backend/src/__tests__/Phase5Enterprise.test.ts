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

describe('StoryForge AI V3 — Phase 5 Enterprise Test Suite', () => {
  const projectId = 'test_phase5_proj_1';
  const userId = 'user_test_99';
  const orgId = 'org_test_100';

  describe('1. CRDT & Real-Time Collaboration', () => {
    it('should process CRDT operations and increment vector clock', () => {
      const op1 = crdtCollaborationServer.processOperation({
        type: 'clip_insert',
        projectId,
        userId,
        clock: 0,
        delta: { clipId: 'c1', trackId: 't1', start: 0, duration: 10 },
      });

      expect(op1.accepted).toBe(true);
      expect(op1.currentClock).toBeGreaterThan(0);
      expect(crdtCollaborationServer.getProjectVectorClock(projectId)).toBe(op1.currentClock);
    });

    it('should track user presence and selection state', () => {
      presenceManager.setUserPresence(projectId, {
        userId,
        userName: 'Test User',
        color: '#FF0055',
        cursorPosition: { x: 100, y: 200, timecode: 14.5 },
        lastActive: new Date().toISOString(),
      });

      const presences = presenceManager.getRoomPresences(projectId);
      expect(presences.length).toBe(1);
      expect(presences[0].userName).toBe('Test User');
      expect(presences[0].cursorPosition?.timecode).toBe(14.5);
    });

    it('should manage frame-accurate video comment threads and replies', () => {
      const thread = threadCommentService.createThread({
        projectId,
        authorId: userId,
        authorName: 'Test Author',
        timecodeSeconds: 42.1,
        content: 'Check color grading on this cut',
        mentions: ['@director'],
      });

      expect(thread.id).toBeDefined();
      expect(thread.content).toContain('color grading');

      const replySuccess = threadCommentService.addReply(thread.id, {
        authorId: 'user_director',
        authorName: 'Director',
        content: 'Adjusted gamma curve +5%',
      });
      expect(replySuccess).toBe(true);

      const reactionSuccess = threadCommentService.addReaction(thread.id, '👍', userId);
      expect(reactionSuccess).toBe(true);

      const updatedThreads = threadCommentService.getProjectThreads(projectId);
      expect(updatedThreads[0].replies.length).toBe(1);
      expect(updatedThreads[0].reactions['👍']).toContain(userId);

      const resolveSuccess = threadCommentService.resolveThread(thread.id, true);
      expect(resolveSuccess).toBe(true);
      expect(threadCommentService.getProjectThreads(projectId)[0].resolved).toBe(true);
    });
  });

  describe('2. Enterprise Workspaces & Governance', () => {
    it('should create workspaces and manage render quota', () => {
      const wsId = 'ws_test_enterprise';
      enterpriseWorkspaceManager.createWorkspace({
        id: wsId,
        organizationId: orgId,
        departmentId: 'dept_marketing',
        name: 'Automated Test Workspace',
        quotaStorageGb: 1000,
        quotaRendersPerMonth: 50,
        membersCount: 5,
      });

      const ws = enterpriseWorkspaceManager.getWorkspaceById(wsId);
      expect(ws).toBeDefined();
      expect(ws?.name).toBe('Automated Test Workspace');

      const consumeRes = enterpriseWorkspaceManager.consumeRenderQuota(wsId, 5);
      expect(consumeRes.success).toBe(true);
      expect(consumeRes.remainingRenders).toBe(45);
    });
  });

  describe('3. Content Review Pipeline', () => {
    it('should submit project to legal, brand, and publishing gates', () => {
      const requests = contentReviewPipeline.submitForReview(projectId, ['brand', 'legal', 'publishing']);
      expect(requests.length).toBe(3);

      expect(contentReviewPipeline.isFullyApproved(projectId)).toBe(false);

      contentReviewPipeline.updateReviewStatus(projectId, 'brand', 'approved', 'reviewer_1', 'Brand guidelines met');
      contentReviewPipeline.updateReviewStatus(projectId, 'legal', 'approved', 'reviewer_2', 'Rights cleared');
      contentReviewPipeline.updateReviewStatus(projectId, 'publishing', 'approved', 'reviewer_3', 'Ready for distribution');

      expect(contentReviewPipeline.isFullyApproved(projectId)).toBe(true);
    });
  });

  describe('4. Marketplace & Asset Catalog', () => {
    it('should list, search, and purchase marketplace assets', () => {
      const assets = marketplaceService.listAssets();
      expect(assets.length).toBeGreaterThan(0);

      const searchRes = marketplaceService.searchAssets('Cyberpunk');
      expect(searchRes.length).toBeGreaterThan(0);
      expect(searchRes[0].title).toContain('Cyberpunk');

      const initialSales = searchRes[0].salesCount;
      const buyRes = marketplaceService.purchaseAsset(searchRes[0].id);
      expect(buyRes.success).toBe(true);
      expect(buyRes.asset?.salesCount).toBe(initialSales + 1);
    });
  });

  describe('5. Plugin SDK Sandbox', () => {
    it('should verify digital signature and register verified plugins', () => {
      const plugins = pluginSDKManager.listPlugins();
      expect(plugins.length).toBeGreaterThan(0);

      const targetId = plugins[0].id;
      const permCheck = pluginSDKManager.checkPermission(targetId, plugins[0].permissions[0]);
      expect(permCheck).toBe(true);

      pluginSDKManager.setPluginStatus(targetId, 'disabled');
      expect(pluginSDKManager.checkPermission(targetId, plugins[0].permissions[0])).toBe(false);

      pluginSDKManager.setPluginStatus(targetId, 'active');
    });

    it('should reject unverified plugin signatures', () => {
      expect(() => {
        pluginSDKManager.installPlugin({
          id: 'plugin_malicious',
          name: 'Untrusted Plugin',
          version: '0.0.1',
          author: 'Unknown',
          permissions: ['system:root'],
          signatureValid: false,
          status: 'installed',
        });
      }).toThrow('failed security digital signature verification');
    });
  });

  describe('6. Creator Intelligence & SEO', () => {
    it('should generate channel CTR, retention, and SEO recommendations', () => {
      const intel = creatorIntelligenceEngine.getChannelIntelligence('channel_official');
      expect(intel.avgCTR).toBeGreaterThan(0);
      expect(intel.retentionCurve).toBeDefined();

      const seo = creatorIntelligenceEngine.generateSEORecommendations('AI Revolution', 'Technology');
      expect(seo.titleScore).toBeGreaterThan(70);
      expect(seo.suggestedTags).toContain('#Technology');
    });
  });

  describe('7. Enterprise Billing & Credits', () => {
    it('should query subscription tiers and deduct credits', () => {
      const sub = enterpriseBillingService.getSubscription('org_enterprise_1');
      expect(sub.plan).toBe('enterprise');

      const consumeRes = enterpriseBillingService.consumeCredits('org_enterprise_1', 100);
      expect(consumeRes.success).toBe(true);
    });
  });

  describe('8. Developer Integrations', () => {
    it('should manage integration connections and trigger webhooks', () => {
      const connections = integrationAdapters.listConnections();
      expect(connections.length).toBeGreaterThan(0);

      const conn = integrationAdapters.connectService('figma', 'design@storyforge.ai');
      expect(conn.connected).toBe(true);

      const webhookRes = integrationAdapters.triggerWebhook('figma', 'asset.exported', { fileKey: 'abc1234' });
      expect(webhookRes.sent).toBe(true);
    });
  });

  describe('9. Notifications & Mobile Companion', () => {
    it('should send notifications, mark read, and calculate mobile summary', () => {
      const notif = notificationService.sendNotification(userId, 'Review Approved', 'Legal has approved your project', 'in_app');
      expect(notif.read).toBe(false);

      const unread = notificationService.getUnreadNotifications(userId);
      expect(unread.some((n) => n.id === notif.id)).toBe(true);

      notificationService.markAsRead(notif.id);
      expect(notificationService.getUnreadNotifications(userId).some((n) => n.id === notif.id)).toBe(false);

      const summary = mobileCompanionService.getMobileSummary(userId);
      expect(summary.activeRenders).toBeDefined();
      expect(summary.quickStats.monthlyViews).toBeDefined();
    });
  });
});
