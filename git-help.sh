#!/bin/bash

# 🧠 SMART GIT HELPER - Shows what you need when you need it

echo "🤔 What do you want to do?"
echo ""
echo "1) Check if my app is safe"
echo "2) See what changed on remote"
echo "3) Switch to different branch"
echo "4) 🚨 MY APP IS BROKEN - RESTORE IT!"
echo "5) Show me all safe commands"
echo ""
read -p "Choose (1-5): " choice

case $choice in
    1)
        echo "🔍 Checking your app protection..."
        ./safe-git.sh status
        ;;
    2)
        echo "🔍 Checking remote changes safely..."
        ./safe-git.sh safe-pull
        ;;
    3)
        echo "🔄 Available branches:"
        git branch -a
        echo ""
        read -p "Enter branch name: " branch
        ./safe-git.sh safe-checkout "$branch"
        ;;
    4)
        echo "🚨 EMERGENCY RESTORE ACTIVATED!"
        ./safe-git.sh emergency-restore
        ;;
    5)
        ./safe-git.sh
        ;;
    *)
        echo "❌ Invalid choice. Run this script again."
        ;;
esac
