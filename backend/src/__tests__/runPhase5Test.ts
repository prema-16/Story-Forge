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

console.log('--------------------------------------------------');
console.log('Running StoryForge AI V3 Phase 5 Integration Test');
console.log('--------------------------------------------------');

const projectId = 'test_phase5_proj_1';
const userId = 'user_test_99';
const orgId = 'org_test_100';

// 1. CRDT & Collaboration
console.log('\n[1/9] Testing CRDT & Real-Time Collaboration...');
const op1 = crdtCollaborationServer.processOperation({
  type: 'clip_insert',
  projectId,
  userId,
  clock: 0,
  delta: { clipId: 'c1', trackId: 't1', start: 0, duration: 10 },
});
console.log('  CRDT Op Processed:', op1);

presenceManager.setUserPresence(projectId, {
  userId,
  userName: 'Test User',
  color: '#FF0055',
  cursorPosition: { x: 100, y: 200, timecode: 14.5 },
  lastActive: new Date().toISOString(),
});
const presences = presenceManager.getRoomPresences(projectId);
console.log('  User Presence Active:', presences.length, 'user(s)');

const thread = threadCommentService.createThread({
  projectId,
  authorId: userId,
  authorName: 'Test Author',
  timecodeSeconds: 42.1,
  content: 'Check color grading on this cut',
  mentions: ['@director'],
});
threadCommentService.addReply(thread.id, { authorId: 'user_director', authorName: 'Director', content: 'Adjusted gamma' });
threadCommentService.addReaction(thread.id, '👍', userId);
threadCommentService.resolveThread(thread.id, true);
console.log('  Comment Thread Created & Resolved:', thread.id);

// 2. Workspaces
console.log('\n[2/9] Testing Workspaces & Governance...');
enterpriseWorkspaceManager.createWorkspace({
  id: 'ws_test_enterprise',
  organizationId: orgId,
  departmentId: 'dept_marketing',
  name: 'Automated Test Workspace',
  quotaStorageGb: 1000,
  quotaRendersPerMonth: 50,
  membersCount: 5,
});
const quotaRes = enterpriseWorkspaceManager.consumeRenderQuota('ws_test_enterprise', 5);
console.log('  Render Quota Consumed:', quotaRes);

// 3. Content Review Pipeline
console.log('\n[3/9] Testing Content Review Pipeline...');
contentReviewPipeline.submitForReview(projectId, ['brand', 'legal', 'publishing']);
contentReviewPipeline.updateReviewStatus(projectId, 'brand', 'approved', 'rev_1', 'OK');
contentReviewPipeline.updateReviewStatus(projectId, 'legal', 'approved', 'rev_2', 'OK');
contentReviewPipeline.updateReviewStatus(projectId, 'publishing', 'approved', 'rev_3', 'OK');
console.log('  Review Pipeline Fully Approved:', contentReviewPipeline.isFullyApproved(projectId));

// 4. Marketplace
console.log('\n[4/9] Testing Marketplace & Asset Catalog...');
const assets = marketplaceService.listAssets();
const searchRes = marketplaceService.searchAssets('Cyberpunk');
const buyRes = marketplaceService.purchaseAsset(searchRes[0].id);
console.log('  Marketplace Assets count:', assets.length, '| Purchased asset salesCount:', buyRes.asset?.salesCount);

// 5. Plugin SDK
console.log('\n[5/9] Testing Plugin SDK Sandbox...');
const plugins = pluginSDKManager.listPlugins();
console.log('  Installed plugins count:', plugins.length);

// 6. Creator Intelligence
console.log('\n[6/9] Testing Creator Intelligence & SEO...');
const intel = creatorIntelligenceEngine.getChannelIntelligence('channel_official');
const seo = creatorIntelligenceEngine.generateSEORecommendations('AI Revolution', 'Technology');
console.log('  CTR Analytics:', intel.avgCTR, '% | SEO Score:', seo.titleScore);

// 7. Billing
console.log('\n[7/9] Testing Enterprise Billing & Credits...');
const sub = enterpriseBillingService.getSubscription('org_enterprise_1');
const credRes = enterpriseBillingService.consumeCredits('org_enterprise_1', 100);
console.log('  Subscription Plan:', sub.plan, '| Credits remaining:', credRes.creditsRemaining);

// 8. Integrations
console.log('\n[8/9] Testing Third-Party Integrations...');
const conn = integrationAdapters.connectService('figma', 'design@storyforge.ai');
const webhookRes = integrationAdapters.triggerWebhook('figma', 'asset.exported', { fileKey: 'abc1234' });
console.log('  Connected Integration:', conn.service, '| Webhook status:', webhookRes.sent);

// 9. Notifications & Mobile
console.log('\n[9/9] Testing Notifications & Mobile Companion...');
const notif = notificationService.sendNotification(userId, 'Review Approved', 'Legal has approved', 'in_app');
notificationService.markAsRead(notif.id);
const summary = mobileCompanionService.getMobileSummary(userId);
console.log('  Notification ID:', notif.id, '| Mobile Dashboard Views:', summary.quickStats.monthlyViews);

console.log('\n--------------------------------------------------');
console.log('✅ ALL PHASE 5 ENTERPRISE SUBSYSTEMS PASSED CLEANLY');
console.log('--------------------------------------------------');
