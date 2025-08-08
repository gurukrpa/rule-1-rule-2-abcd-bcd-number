#!/bin/bash

# Environment Switcher for Production/Automation Testing
# Usage: ./switch-environment.sh [production|automation]

echo "🔄 Environment Switcher"
echo "=================================="
echo ""

# Default to automation if no argument provided
ENVIRONMENT=${1:-automation}

case "$ENVIRONMENT" in
  "production")
    echo "🏭 Switching to PRODUCTION environment..."
    
    # Backup current .env if it exists
    if [ -f ".env" ]; then
      cp .env .env.backup
      echo "✅ Current .env backed up"
    fi
    
    # Copy production environment
    if [ -f ".env.production" ]; then
      cp .env.production .env
      echo "✅ Switched to production environment"
      
      # Switch to main branch for production
      git checkout main 2>/dev/null || git checkout master 2>/dev/null
      
      echo "📊 Production environment active"
      echo "   - Supabase: Production database"
      echo "   - Firebase: Production hosting"
      echo "   - Branch: main/master"
    else
      echo "❌ .env.production not found!"
      exit 1
    fi
    ;;
    
  "automation")
    echo "🤖 Switching to AUTOMATION environment..."
    
    # Backup current .env if it exists
    if [ -f ".env" ]; then
      cp .env .env.backup
      echo "✅ Current .env backed up"
    fi
    
    # Copy automation environment
    if [ -f ".env.automation" ]; then
      cp .env.automation .env
      echo "✅ Switched to automation environment"
      
      # Switch to automation branch
      git checkout feat/duplicate-for-automation 2>/dev/null || echo "⚠️  Staying on current branch"
      
      echo "🧪 Automation environment active"
      echo "   - Supabase: Automation/staging database"
      echo "   - Firebase: Automation hosting"
      echo "   - Branch: feat/duplicate-for-automation"
      echo "   - Banner: Environment banner will show"
    else
      echo "❌ .env.automation not found!"
      exit 1
    fi
    ;;
    
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: ./switch-environment.sh [production|automation]"
    exit 1
    ;;
esac

echo ""
echo "✅ Environment switching complete!"
echo ""
echo "💡 Current environment variables:"
echo "   VITE_AUTOMATION_MODE: $(grep VITE_AUTOMATION_MODE .env 2>/dev/null || echo 'not set')"
echo "   VITE_ENVIRONMENT: $(grep VITE_ENVIRONMENT .env 2>/dev/null || echo 'not set')"
echo ""
echo "🔄 Restart your dev server to apply changes: npm run dev"
