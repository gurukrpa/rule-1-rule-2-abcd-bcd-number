#!/bin/bash

# 🔒 SAFE GIT COMMANDS FOR PROTECTED APPLICATION
# Use these commands instead of raw git commands

set -e

command="$1"
shift

case "$command" in
    "safe-pull")
        echo "🔍 Checking for remote changes..."
        git fetch origin
        
        BEHIND=$(git rev-list --count HEAD..origin/checkpoint-for-revert-application 2>/dev/null || echo "0")
        if [ "$BEHIND" -gt 0 ]; then
            echo "⚠️  WARNING: Remote has $BEHIND new commits"
            echo "🛑 STOPPING: Manual review required"
            echo "💡 Review changes with: git log HEAD..origin/checkpoint-for-revert-application"
            exit 1
        else
            echo "✅ No remote changes. Your app is safe."
        fi
        ;;
        
    "safe-checkout")
        TARGET_BRANCH="$1"
        if [ "$TARGET_BRANCH" = "main" ] || [ "$TARGET_BRANCH" = "master" ]; then
            echo "🛑 BLOCKED: Cannot checkout main/master (might break your app)"
            echo "💡 Your working app is on: checkpoint-for-revert-application"
            exit 1
        fi
        git checkout "$TARGET_BRANCH"
        ;;
        
    "emergency-restore")
        echo "🚨 EMERGENCY RESTORE ACTIVATED"
        echo "🔄 Restoring working application..."
        git checkout working-app-backup
        git branch -f checkpoint-for-revert-application working-app-backup
        git checkout checkpoint-for-revert-application
        echo "✅ Application restored to working state"
        ;;
        
    "status")
        echo "📊 PROTECTION STATUS:"
        echo "=================="
        ./protect-working-app.sh
        ;;
        
    *)
        echo "🛡️ SAFE GIT COMMANDS:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ SAFE COMMANDS (Always Use These):"
        echo "├── ./safe-git.sh safe-pull      # Safely check for remote changes"
        echo "├── ./safe-git.sh safe-checkout  # Safely switch branches"
        echo "├── ./safe-git.sh emergency-restore # 🚨 RESTORE WORKING APP"
        echo "└── ./safe-git.sh status         # Check protection status"
        echo ""
        echo "❌ NEVER USE THESE DANGEROUS COMMANDS:"
        echo "├── git pull origin main         # Could break your app"
        echo "├── git checkout main            # Would switch to broken code"
        echo "└── git merge main               # Could overwrite your working code"
        echo ""
        echo "🚨 PANIC BUTTON: ./safe-git.sh emergency-restore"
        echo "💡 MEMORY TRICK: Start with './safe-git.sh' = SAFE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        ;;
esac
