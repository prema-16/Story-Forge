# AIOS Queue Engine Documentation

## Overview
Manages 11 dedicated BullMQ queues (`generation`, `image`, `voice`, `video`, `render`, `seo`, `thumbnail`, `publish`, `cleanup`, `retry`, `dead-letter`).

## Features
- Priority weighting (Premium Tier = 1, Standard = 5).
- Dead-Letter Queue (DLQ) automatic relocation after 3 failed attempts.
- Queue pause, resume, and inline execution fallback when Redis is offline.
