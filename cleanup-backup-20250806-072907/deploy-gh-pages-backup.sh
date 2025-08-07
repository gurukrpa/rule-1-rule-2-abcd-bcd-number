#!/bin/bash

echo "🚀 Deploying to GitHub Pages..."

# Hybrid approach: Use external SSD for storage, internal SSD for git operations
TEMP_DIR="/tmp/gh-pages-deploy-$(date +%s)"
DIST_DIR="/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/dist"

echo "📁 Creating small temporary git directory on internal SSD: $TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "📋 Copying only essential files (this saves internal SSD space)..."
# Copy only the essential files we need for GitHub Pages
cp "$DIST_DIR/index.html" "$TEMP_DIR/"
cp "$DIST_DIR/404.html" "$TEMP_DIR/"
cp "$DIST_DIR/favicon.ico" "$TEMP_DIR/"
cp -r "$DIST_DIR/assets" "$TEMP_DIR/"

echo "🧹 Cleaning up any system files..."
find "$TEMP_DIR" -name "._*" -delete
find "$TEMP_DIR" -name ".DS_Store" -delete

cd "$TEMP_DIR"

echo "🔧 Initializing git repository..."
git init
git checkout -b gh-pages

echo "📝 Adding files..."
git add .
git commit -m "Deploy to GitHub Pages - $(date)"

echo "🔗 Adding remote..."
git remote add origin git@github.com:gurukrpa/rule-1-rule-2-abcd-bcd-number.git

echo "🚀 Pushing to gh-pages..."
git push -f origin gh-pages

echo "🧹 Cleaning up temporary directory..."
cd /
rm -rf "$TEMP_DIR"

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://gurukrpa.github.io/rule-1-rule-2-abcd-bcd-number/"
echo "⏰ Note: GitHub Pages may take a few minutes to update."
