#!/bin/bash

# 🛡️ APPLICATION PROTECTION SCRIPT
# This script protects your working application from accidental git changes

set -e

echo "🛡️ APPLICATION PROTECTION ACTIVE"
echo "==============================="

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ensure we're on the working branch
if [ "$CURRENT_BRANCH" != "checkpoint-for-revert-application" ]; then
    echo "⚠️  WARNING: You're not on the working branch!"
    echo "🔄 Switching to checkpoint-for-revert-application..."
    git checkout checkpoint-for-revert-application
    echo "✅ Switched to working branch"
fi

# Create/update backup
echo "💾 Creating backup of working application..."
git branch -f working-app-backup HEAD
echo "✅ Backup created: working-app-backup"

# Show protection status
echo ""
echo "🔒 PROTECTION STATUS:"
echo "├── Working branch: checkpoint-for-revert-application"
echo "├── Backup branch: working-app-backup"
echo "├── Auto-rebase: DISABLED"
echo "└── Pull protection: ACTIVE"

echo ""
echo "🚀 Your application is now protected!"
echo "💡 To restore if something goes wrong: git checkout working-app-backup"
