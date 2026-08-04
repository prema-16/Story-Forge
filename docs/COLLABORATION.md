# Real-Time CRDT Collaboration & Live Cursors Documentation

## Overview
Conflict-free real-time multi-user editing using Yjs CRDTs and vector clocks.

## Features
- **Live Cursors & Presence**: Broadcasts active cursor coordinates and timeline clip selections.
- **Threaded Inline Comments**: Supports `@user` mentions, emoji reactions, and approval review requests.
- **Conflict Resolution**: Mathematical CRDT convergence guarantees zero document corruption during simultaneous edits.
