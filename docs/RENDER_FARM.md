# Render Farm & Worker Scheduling Documentation

## Overview
BullMQ worker cluster managing CPU and GPU worker nodes across regions.

## Features
- **GPU Detection**: Auto-detects NVIDIA CUDA / Apple Metal GPUs for hardware acceleration.
- **Worker Balancing**: Routes high-resolution 4K jobs to GPU nodes and 720p/1080p jobs to CPU nodes.
- **Autoscaling & Heartbeats**: Monitored heartbeats and CPU/RAM load balancing.
