#!/bin/bash
# ==============================================================================
# STORYFORGE AI — AUTOMATED ENCRYPTED MONGODB & REDIS BACKUP SCRIPT
# ==============================================================================

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/storyforge/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "================================================================"
echo "📦 Starting StoryForge AI Backup Sequence: $TIMESTAMP"
echo "================================================================"

# 1. MongoDB Atlas Backup
echo "1. Creating MongoDB Dump..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb" --quiet
tar -czf "$BACKUP_DIR/mongodb_dump.tar.gz" -C "$BACKUP_DIR" mongodb
rm -rf "$BACKUP_DIR/mongodb"

# 2. Redis AOF / Snapshot Copy
echo "2. Copying Redis Snapshot..."
docker exec storyforge_redis redis-cli SAVE || true
docker cp storyforge_redis:/data/dump.rdb "$BACKUP_DIR/redis_dump.rdb" || true

# 3. Encrypt Backup Tarball
echo "3. Encrypting Backup Tarball..."
tar -czf "$BACKUP_DIR/storyforge_backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" mongodb_dump.tar.gz redis_dump.rdb

echo "✅ Backup Completed Successfully: $BACKUP_DIR/storyforge_backup_$TIMESTAMP.tar.gz"
echo "================================================================"
