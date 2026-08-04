import { DAGGraph } from './DAGRunner';

export const YOUTUBE_SHORTS_TEMPLATE: DAGGraph = {
  id: 'tmpl_shorts_v1',
  title: 'YouTube Shorts High-Retention DAG',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    { id: 'n1', name: 'Idea & Trend Hook', type: 'sequential', agentId: 'ai-idea-generator', dependsOn: [], status: 'pending' },
    { id: 'n2', name: 'Short Scriptwriter', type: 'sequential', agentId: 'ai-writer', dependsOn: ['n1'], status: 'pending' },
    { id: 'n3', name: 'Scene Breakdown', type: 'sequential', agentId: 'ai-scene-planner', dependsOn: ['n2'], status: 'pending' },
    // Parallel Execution Nodes
    { id: 'n4', name: 'Prompt Compiler', type: 'parallel', agentId: 'ai-prompt-engineer', dependsOn: ['n3'], status: 'pending' },
    { id: 'n5', name: 'Voice Synthesis', type: 'parallel', agentId: 'ai-voice-director', dependsOn: ['n3'], status: 'pending' },
    { id: 'n6', name: 'Thumbnail Designer', type: 'parallel', agentId: 'ai-thumbnail-designer', dependsOn: ['n3'], status: 'pending' },
    { id: 'n7', name: 'SEO Optimization', type: 'parallel', agentId: 'ai-seo-specialist', dependsOn: ['n3'], status: 'pending' },
    // Final Render Node
    { id: 'n8', name: 'Video Render Engine', type: 'sequential', agentId: 'ai-video-director', dependsOn: ['n4', 'n5', 'n6', 'n7'], status: 'pending' },
  ],
};

export const DOCUMENTARY_TEMPLATE: DAGGraph = {
  id: 'tmpl_documentary_v1',
  title: 'Deep In-Depth Documentary DAG',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    { id: 'd1', name: 'Domain Fact Research', type: 'sequential', agentId: 'ai-researcher', dependsOn: [], status: 'pending' },
    { id: 'd2', name: 'Fact-Check Verification', type: 'sequential', agentId: 'ai-fact-checker', dependsOn: ['d1'], status: 'pending' },
    { id: 'd3', name: 'Documentary Script', type: 'sequential', agentId: 'ai-writer', dependsOn: ['d2'], status: 'pending' },
    { id: 'd4', name: 'Script Reviewer', type: 'sequential', agentId: 'ai-script-reviewer', dependsOn: ['d3'], status: 'pending' },
    { id: 'd5', name: 'Scene Planner', type: 'sequential', agentId: 'ai-scene-planner', dependsOn: ['d4'], status: 'pending' },
    { id: 'd6', name: 'Voiceover Synthesis', type: 'parallel', agentId: 'ai-voice-director', dependsOn: ['d5'], status: 'pending' },
    { id: 'd7', name: 'Subtitles Generator', type: 'parallel', agentId: 'ai-subtitle-generator', dependsOn: ['d5'], status: 'pending' },
    { id: 'd8', name: 'Thumbnail Concept', type: 'parallel', agentId: 'ai-thumbnail-designer', dependsOn: ['d5'], status: 'pending' },
    { id: 'd9', name: 'Final QA Review', type: 'sequential', agentId: 'ai-qa-reviewer', dependsOn: ['d6', 'd7', 'd8'], status: 'pending' },
  ],
};
