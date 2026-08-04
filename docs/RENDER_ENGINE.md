# Distributed Render Engine Documentation

## Overview
Orchestrates parallel scene rendering, background execution, resolution scaling (720p, 1080p, 4K), and checkpoint recovery.

## Checkpoint Recovery
The `RenderCheckpointManager` records scene completions and frame timestamps (`RenderFrameCheckpoint`). If a worker node fails, the job resumes from the last completed frame without re-rendering prior scenes.
