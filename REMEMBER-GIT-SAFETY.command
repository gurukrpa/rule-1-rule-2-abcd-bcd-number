#!/bin/bash

# 🚨 EMERGENCY GIT SAFETY HELPER
# Double-click this file to see safe commands

echo "🛡️ GIT SAFETY COMMANDS - ALWAYS USE THESE:"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ SAFE COMMANDS:"
echo "  ./safe-git.sh safe-pull           # Check for remote changes safely"
echo "  ./safe-git.sh safe-checkout dev   # Switch branches safely"
echo "  ./safe-git.sh emergency-restore   # 🚨 RESTORE WORKING APP"
echo "  ./safe-git.sh status              # Check protection status"
echo ""
echo "❌ NEVER USE THESE:"
echo "  git pull origin main              # Could break your app"
echo "  git checkout main                 # Would switch to broken code"
echo "  git merge main                    # Could overwrite your working code"
echo ""
echo "🚨 PANIC BUTTON - IF YOUR APP BREAKS:"
echo "  ./safe-git.sh emergency-restore"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"

# Keep terminal open
read -p "Press Enter to continue..."
