# AIOS Workflow Engine (DAG) Documentation

## Overview
Replaces rigid sequential generation pipelines with dynamic Directed Acyclic Graph (DAG) execution graphs (`DAGRunner`).

## Node Types & Capabilities
- **Sequential**: Executes in strict dependency order.
- **Parallel**: Executes concurrently as soon as all prerequisite dependencies complete.
- **Conditional**: Evaluates output scores before branching.
- **Retry / Loop**: Automatic retry with exponential backoff.

## Execution Control
- Supports `pause`, `resume`, `cancel`, `rollback`, and `executionLogs`.
- Visual DAG export structure for frontend rendering.
