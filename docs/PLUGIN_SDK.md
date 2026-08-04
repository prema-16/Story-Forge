# Plugin SDK & Security Sandbox Documentation

## Overview
Allows third-party developers to extend StoryForge AI studio capabilities via secure sandboxed plugins.

## Security Controls
- **Digital Signatures**: Plugins must be cryptographically signed by verified developers.
- **Worker Sandboxing**: Code executes inside isolated web worker sandboxes with explicit permission manifests (`storage:read`, `timeline:write`).
