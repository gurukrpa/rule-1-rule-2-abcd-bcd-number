#!/bin/bash

# 🚀 GitHub Pages Deployment Script
# This script safely deploys your app to GitHub Pages

set -e

echo "🚀 GITHUB PAGES DEPLOYMENT"
echo "=========================="

# Check if we're on the right branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ensure we're on your working branch
if [ "$CURRENT_BRANCH" != "checkpoint-for-revert-application" ]; then
    echo "⚠️  WARNING: Not on working branch!"
    echo "🔄 Switching to checkpoint-for-revert-application..."
    git checkout checkpoint-for-revert-application
fi

# Update backup before deployment
echo "💾 Creating backup before deployment..."
git branch -f working-app-backup HEAD
echo "✅ Backup created: working-app-backup"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes!"
    echo "🔄 Committing changes first..."
    git add .
    git commit -m "Pre-deployment commit: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "✅ Changes committed"
fi

# Build the application
echo "🔨 Building application for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to GitHub Pages
    echo "🌐 Deploying to GitHub Pages..."
    npm run deploy
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 DEPLOYMENT SUCCESSFUL!"
        echo "========================="
        echo "🌍 Your app is now live at:"
        echo "   https://gurukrpa.github.io/rule-1-rule-2-abcd-bcd-number/"
        echo ""
        echo "📊 Deployment Details:"
        echo "├── Branch: gh-pages"
        echo "├── Build: dist/"
        echo "├── Status: LIVE"
        echo "└── Time: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "💡 It may take 1-2 minutes for changes to appear online"
    else
        echo "❌ Deployment failed!"
        echo "💡 Check the error messages above"
        exit 1
    fi
else
    echo "❌ Build failed!"
    echo "💡 Fix the build errors and try again"
    exit 1
fi
