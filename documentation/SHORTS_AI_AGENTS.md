# 22 Shorts AI Agent Swarm Specification

All 22 Shorts agents extend `BaseAgentV2` and are registered in `AgentRegistryV2`:

| Agent | Agent ID | Credits | Focus |
|-------|----------|---------|-------|
| Hook Agent | `shorts-hook-agent` | 2 | 10+ hook variations |
| Retention Agent | `shorts-retention-agent` | 2 | 3s/10s retention curve |
| Virality Scorer | `shorts-virality-agent` | 2 | 0-100 Virality Score |
| Transition Agent | `shorts-transition-agent` | 1 | Scene pacing & cuts |
| Sound Effect Agent | `shorts-sfx-agent` | 1 | Audio triggers & SFX |
| Color Grading Agent | `shorts-color-agent` | 1 | Mobile OLED LUT |
| Batch Agent | `shorts-batch-agent` | 5 | 10-500 shorts queue |
| AI Clip Finder | `shorts-clip-finder-agent` | 4 | Long-form video extraction |
| Trend Engine | `shorts-trend-agent` | 2 | Platform trend signals |
| Shorts Scriptwriter | `shorts-script-agent` | 3 | Vertical scriptwriting |
| Shorts Scene Planner | `shorts-scene-planner-agent` | 2 | 3-second scene breakdown |
