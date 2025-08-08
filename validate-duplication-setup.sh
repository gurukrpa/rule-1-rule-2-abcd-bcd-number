#!/bin/bash

echo "🔍 Validating Duplication Setup"
echo "================================="
echo ""

# Check environment files
echo "�� Environment Files:"
if [ -f ".env.production" ]; then
    echo "   ✅ .env.production exists"
else
    echo "   ❌ .env.production missing"
fi

if [ -f ".env.automation" ]; then
    echo "   ✅ .env.automation exists"
else
    echo "   ❌ .env.automation missing"
fi

if [ -f ".env" ]; then
    echo "   ✅ .env exists (current environment)"
    
    # Check which environment is active
    if grep -q "VITE_AUTOMATION_MODE=true" .env; then
        echo "   🤖 Current: AUTOMATION environment"
    else
        echo "   🏭 Current: PRODUCTION environment"
    fi
else
    echo "   ❌ .env missing"
fi

echo ""

# Check environment switcher
echo "🔄 Environment Switcher:"
if [ -f "switch-environment.sh" ] && [ -x "switch-environment.sh" ]; then
    echo "   ✅ switch-environment.sh exists and is executable"
else
    echo "   ❌ switch-environment.sh missing or not executable"
fi

echo ""

# Check component files
echo "🧩 Component Files:"
if [ -f "src/components/EnvironmentBanner.jsx" ]; then
    echo "   ✅ EnvironmentBanner.jsx exists"
    
    # Check if it has content
    if [ -s "src/components/EnvironmentBanner.jsx" ]; then
        echo "   ✅ EnvironmentBanner.jsx has content"
    else
        echo "   ⚠️  EnvironmentBanner.jsx is empty"
    fi
else
    echo "   ❌ EnvironmentBanner.jsx missing"
fi

echo ""

# Check App.jsx integration
echo "🔗 App.jsx Integration:"
if grep -q "EnvironmentBanner" src/App.jsx; then
    echo "   ✅ EnvironmentBanner imported in App.jsx"
    
    if grep -q "<EnvironmentBanner" src/App.jsx; then
        echo "   ✅ EnvironmentBanner component used in App.jsx"
    else
        echo "   ⚠️  EnvironmentBanner imported but not used"
    fi
else
    echo "   ❌ EnvironmentBanner not found in App.jsx"
fi

echo ""

# Check .gitignore protection
echo "🛡️  Security & Git Protection:"
if grep -q ".env.automation" .gitignore; then
    echo "   ✅ .env.automation protected in .gitignore"
else
    echo "   ⚠️  .env.automation not explicitly protected in .gitignore"
fi

if grep -q ".env" .gitignore; then
    echo "   ✅ .env files protected in .gitignore"
else
    echo "   ❌ .env files not protected in .gitignore"
fi

echo ""

# Check current git branch
echo "🌿 Git Branch Status:"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "   📍 Current branch: $CURRENT_BRANCH"

if git branch | grep -q "feat/duplicate-for-automation"; then
    echo "   ✅ Automation branch exists"
else
    echo "   ⚠️  Automation branch missing"
fi

echo ""

# Check environment variables in current .env
echo "🔧 Current Environment Variables:"
if [ -f ".env" ]; then
    echo "   VITE_AUTOMATION_MODE: $(grep VITE_AUTOMATION_MODE .env 2>/dev/null | cut -d'=' -f2 || echo 'not set')"
    echo "   VITE_ENVIRONMENT: $(grep VITE_ENVIRONMENT .env 2>/dev/null | cut -d'=' -f2 || echo 'not set')"
    echo "   VITE_SUPABASE_URL: $(grep VITE_SUPABASE_URL .env 2>/dev/null | cut -d'=' -f2 | head -c 30)..."
else
    echo "   ❌ No .env file to check"
fi

echo ""

# Summary
echo "📊 Setup Summary:"
echo "================================="

# Count successful checks
CHECKS=0
PASSED=0

# Environment files check
CHECKS=$((CHECKS + 3))
[ -f ".env.production" ] && PASSED=$((PASSED + 1))
[ -f ".env.automation" ] && PASSED=$((PASSED + 1))
[ -f ".env" ] && PASSED=$((PASSED + 1))

# Environment switcher check
CHECKS=$((CHECKS + 1))
[ -f "switch-environment.sh" ] && [ -x "switch-environment.sh" ] && PASSED=$((PASSED + 1))

# Component check
CHECKS=$((CHECKS + 1))
[ -f "src/components/EnvironmentBanner.jsx" ] && [ -s "src/components/EnvironmentBanner.jsx" ] && PASSED=$((PASSED + 1))

# App.jsx integration check
CHECKS=$((CHECKS + 1))
grep -q "EnvironmentBanner" src/App.jsx && grep -q "<EnvironmentBanner" src/App.jsx && PASSED=$((PASSED + 1))

echo "   ✅ Passed: $PASSED/$CHECKS checks"

if [ $PASSED -eq $CHECKS ]; then
    echo "   🎉 Duplication setup is COMPLETE!"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Create actual Supabase automation project"
    echo "   2. Create actual Firebase automation project"
    echo "   3. Update .env.automation with real credentials"
    echo "   4. Test complete isolation between environments"
else
    echo "   ⚠️  Setup needs attention - see issues above"
fi

echo ""
