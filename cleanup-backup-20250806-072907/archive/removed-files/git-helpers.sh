#!/bin/bash

# Git Helper Script for Safe Logic Development
# Usage: ./git-helpers.sh <command> [arguments]

case "$1" in
  "new-logic")
    if [ -z "$2" ]; then
      echo "❌ Please provide a branch name: ./git-helpers.sh new-logic branch-name"
      exit 1
    fi
    echo "🔄 Saving current work..."
    git add .
    git commit -m "💾 Auto-save before creating new branch: $2"
    echo "🌱 Creating new branch: $2"
    git checkout -b "$2"
    echo "✅ Ready to experiment! You're now on branch: $2"
    ;;
    
  "save-progress")
    if [ -z "$2" ]; then
      echo "❌ Please provide a commit message: ./git-helpers.sh save-progress 'your message'"
      exit 1
    fi
    git add .
    git commit -m "$2"
    echo "✅ Progress saved: $2"
    ;;
    
  "safe-merge")
    if [ -z "$2" ]; then
      echo "❌ Please provide branch name to merge: ./git-helpers.sh safe-merge branch-name"
      exit 1
    fi
    echo "🔄 Switching to main..."
    git checkout main
    echo "🔀 Merging $2 into main..."
    git merge "$2"
    echo "✅ Branch $2 merged into main!"
    echo "🧹 Delete branch $2? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      git branch -d "$2"
      echo "✅ Branch $2 deleted!"
    fi
    ;;
    
  "discard-experiment")
    if [ -z "$2" ]; then
      echo "❌ Please provide branch name to discard: ./git-helpers.sh discard-experiment branch-name"
      exit 1
    fi
    echo "⚠️  This will discard all changes in branch $2. Are you sure? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      git checkout main
      git branch -D "$2"
      echo "🗑️  Branch $2 discarded. Back to main."
    fi
    ;;
    
  "status")
    echo "📊 Git Status Report"
    echo "==================="
    echo "🌿 Current branch: $(git branch --show-current)"
    echo "📋 All branches:"
    git branch
    echo ""
    echo "📈 Recent commits:"
    git log --oneline -5
    ;;
    
  "backup")
    timestamp=$(date +"%Y%m%d_%H%M%S")
    git add .
    git commit -m "🛡️  Backup checkpoint: $timestamp"
    echo "✅ Backup created: $timestamp"
    ;;
    
  *)
    echo "🚀 Git Helper Commands:"
    echo "======================"
    echo "new-logic <name>        - Create new branch for experimentation"
    echo "save-progress <msg>     - Save current work with message"
    echo "safe-merge <branch>     - Merge branch into main safely"
    echo "discard-experiment <br> - Discard experimental branch"
    echo "status                  - Show current git status"
    echo "backup                  - Create timestamped backup"
    echo ""
    echo "Example usage:"
    echo "./git-helpers.sh new-logic step-7-ui-enhancement"
    echo "./git-helpers.sh save-progress 'Fixed button styling'"
    echo "./git-helpers.sh safe-merge step-7-ui-enhancement"
    ;;
esac
