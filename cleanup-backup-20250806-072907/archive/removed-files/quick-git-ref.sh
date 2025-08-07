#!/bin/zsh

# 🚀 QUICK GIT COMMANDS FOR SAFE EXPERIMENTATION
# ===============================================

echo "🎯 Git Workflow Quick Commands"
echo "=============================="
echo ""

# Set colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${GREEN}📋 BEFORE STARTING NEW LOGIC:${NC}"
echo "   git checkout -b new-feature-name"
echo "   # Example: git checkout -b step-7-ui-enhancement"
echo ""

echo "${BLUE}💾 SAVE PROGRESS:${NC}"
echo "   git add . && git commit -m 'Your progress message'"
echo "   # Example: git add . && git commit -m 'Fixed validation logic'"
echo ""

echo "${GREEN}✅ IF LOGIC WORKS - MERGE IT:${NC}"
echo "   git checkout main"
echo "   git merge your-branch-name"
echo "   git branch -d your-branch-name"
echo ""

echo "${RED}❌ IF LOGIC BREAKS - DISCARD IT:${NC}"
echo "   git checkout main"
echo "   git branch -D your-branch-name"
echo ""

echo "${YELLOW}📊 CHECK STATUS:${NC}"
echo "   git branch                  # List branches"
echo "   git log --oneline -5        # Recent commits"
echo "   git status                  # Current changes"
echo ""

echo "${BLUE}🔄 QUICK NAVIGATION:${NC}"
echo "   git checkout main           # Back to main"
echo "   git checkout branch-name    # Switch to branch"
echo ""

echo "${GREEN}🛡️  EMERGENCY BACKUP:${NC}"
echo "   git add . && git commit -m '🛡️  Emergency backup'"
echo ""

echo "💡 Current branch: $(git branch --show-current)"
echo "📂 Current directory: $(pwd | xargs basename)"
