#!/bin/bash

# 🔥 Firebase Enabler Script
# This script helps you enable Firebase for production deployment

echo "🔥 Firebase Production Enabler"
echo "================================"
echo ""

# Check if Firebase is already configured
if grep -q "VITE_FIREBASE_API_KEY=" .env && ! grep -q "^#.*VITE_FIREBASE_API_KEY=" .env; then
    echo "✅ Firebase environment variables already configured"
    FIREBASE_CONFIGURED=true
else
    echo "⚠️  Firebase environment variables not configured"
    FIREBASE_CONFIGURED=false
fi

# Check if Firebase imports are enabled
if grep -q "^import.*firebase" src/services/FirebaseService.js; then
    echo "✅ Firebase imports already enabled"
    IMPORTS_ENABLED=true
else
    echo "⚠️  Firebase imports are commented out"
    IMPORTS_ENABLED=false
fi

echo ""

if [ "$FIREBASE_CONFIGURED" = true ] && [ "$IMPORTS_ENABLED" = true ]; then
    echo "🎉 Firebase is fully configured and ready for production!"
    echo ""
    echo "🚀 You can now deploy with dual-service mode:"
    echo "   ./deploy-production.sh"
    exit 0
fi

echo "🛠️  Firebase needs configuration. Here's what to do:"
echo ""

if [ "$FIREBASE_CONFIGURED" = false ]; then
    echo "1️⃣  Set up Firebase environment variables:"
    echo "   • Follow the guide in FIREBASE-SETUP-GUIDE.md"
    echo "   • Create a Firebase project at https://console.firebase.google.com/"
    echo "   • Add the config to your .env file"
    echo ""
fi

if [ "$IMPORTS_ENABLED" = false ]; then
    echo "2️⃣  Enable Firebase imports:"
    echo "   Would you like me to enable Firebase imports now? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🔧 Enabling Firebase imports..."
        
        # Create a backup
        cp src/services/FirebaseService.js src/services/FirebaseService.js.backup
        
        # Enable Firebase imports
        sed -i '' 's|^/\*|// FIREBASE ENABLED FOR PRODUCTION|g' src/services/FirebaseService.js
        sed -i '' 's|\*/|// END FIREBASE CONFIGURATION|g' src/services/FirebaseService.js
        sed -i '' 's|^// Development mode - Firebase disabled|// Production mode - Firebase enabled|g' src/services/FirebaseService.js
        
        echo "✅ Firebase imports enabled!"
        echo "💾 Backup saved as FirebaseService.js.backup"
        echo ""
        
        if [ "$FIREBASE_CONFIGURED" = true ]; then
            echo "🎉 Firebase is now fully configured!"
            echo "🚀 Ready to deploy with: ./deploy-production.sh"
        else
            echo "⚠️  Still need to configure environment variables"
            echo "📝 See FIREBASE-SETUP-GUIDE.md for instructions"
        fi
    else
        echo "⏭️  Skipping Firebase import enablement"
    fi
fi

echo ""
echo "📚 For detailed instructions, see:"
echo "   • FIREBASE-SETUP-GUIDE.md - Complete Firebase setup"
echo "   • DUAL-SERVICE-SETUP.md - Dual-service architecture overview"
