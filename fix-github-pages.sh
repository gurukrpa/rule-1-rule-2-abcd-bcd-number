#!/bin/zsh

# 🚀 Quick GitHub Pages Fix Script
# This script provides alternative methods to deploy when gh-pages is slow

echo "🔧 GitHub Pages Quick Fix"
echo "========================="
echo ""

# Check if there's a running gh-pages process
if pgrep -f "gh-pages" > /dev/null; then
    echo "⚠️  gh-pages deployment is currently running..."
    echo "   You can either wait for it to complete or kill it and try alternatives"
    echo ""
    echo "🔄 Options:"
    echo "   1. Wait for current deployment (recommended)"
    echo "   2. Kill current deployment and try manual method"
    echo ""
    read -r "choice?Choose option (1 or 2): "
    
    if [[ "$choice" == "2" ]]; then
        echo "🛑 Killing gh-pages processes..."
        pkill -f "gh-pages"
        sleep 2
    else
        echo "⏳ Waiting for deployment to complete..."
        while pgrep -f "gh-pages" > /dev/null; do
            sleep 5
            echo "   Still deploying..."
        done
        echo "✅ Deployment completed!"
        exit 0
    fi
fi

# Manual deployment method
echo "🛠️  Manual GitHub Pages Deployment"
echo ""

# Ensure we have a fresh build
echo "1️⃣  Building application..."
npm run build

if [[ $? -ne 0 ]]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Check if gh-pages branch exists
echo "2️⃣  Checking gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "✅ gh-pages branch exists"
else
    echo "🔧 Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
fi

# Deploy using git subtree (alternative method)
echo "3️⃣  Deploying using git subtree..."
git add dist -f
git commit -m "Add dist folder for deployment" --allow-empty

# Push dist folder to gh-pages branch
git subtree push --prefix dist origin gh-pages --force

if [[ $? -eq 0 ]]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "🔗 Your site should be available at:"
    echo "   https://gurukrpa.github.io/rule-1-rule-2-abcd-bcd-number/"
    echo ""
    echo "🧪 Test the dual-service demo at:"
    echo "   https://gurukrpa.github.io/rule-1-rule-2-abcd-bcd-number/dual-service-demo"
    echo ""
    echo "⏰ Note: GitHub Pages may take 2-5 minutes to update"
else
    echo "❌ Deployment failed!"
    echo ""
    echo "🔧 Alternative: Manual upload to GitHub"
    echo "   1. Go to your GitHub repository"
    echo "   2. Settings > Pages"
    echo "   3. Set source to 'Deploy from a branch'"
    echo "   4. Select 'gh-pages' branch"
    echo "   5. Click Save"
fi

# Clean up
git reset --soft HEAD~1
