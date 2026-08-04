#!/bin/bash
# ==============================================================================
# STORYFORGE AI — DISASTER RECOVERY RESTORATION SCRIPT
# ==============================================================================

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore_mongodb_redis.sh /path/to/storyforge_backup_YYYYMMDD_HHMMSS.tar.gz"
  exit 1
fi

BACKUP_TAR=$1
RESTORE_DIR="/tmp/storyforge_restore_$(date +%s)"
mkdir -p "$RESTORE_DIR"

echo "================================================================"
echo "🚨 Starting StoryForge AI Disaster Recovery Restoration..."
echo "================================================================"

# 1. Unpack Tarball
tar -xzf "$BACKUP_TAR" -C "$RESTORE_DIR"

# 2. Restore MongoDB
echo "1. Restoring MongoDB Database..."
tar -xzf "$RESTORE_DIR/mongodb_dump.tar.gz" -C "$RESTORE_DIR"
mongorestore --uri="$MONGODB_URI" "$RESTORE_DIR/mongodb" --drop --quiet

# 3. Restore Redis
echo "2. Restoring Redis Database..."
if [ -f "$RESTORE_DIR/redis_dump.rdb" ]; then
  docker stop storyforge_redis || true
  docker cp "$RESTORE_DIR/redis_dump.rdb" storyforge_redis:/data/dump.rdb
  docker start storyforge_redis
fi

rm -rf "$RESTORE_DIR"

echo "✅ Disaster Recovery Restoration Completed Successfully!"
echo "================================================================"
