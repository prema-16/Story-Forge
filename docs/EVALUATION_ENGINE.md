# AIOS Evaluation Engine Documentation

## Overview
Scores generated output quality on a 0-100 scale for Hooks, Scripts, Scenes, Images, Voice, Music, SEO, and Thumbnails.

## Auto-Regeneration Loop
If output score falls below 75, the Evaluation Engine flags the node with `autoRegenerate: true` and triggers automated step re-execution with fallback parameters.
