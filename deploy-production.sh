#!/bin/bash

# 🚀 Production Deployment Script for Dual-Service Mode
# This script enables Firebase for production deployment

echo "🔄 Starting production deployment with dual-service mode..."

# Check if Firebase environment variables are set
if [ -z "$VITE_FIREBASE_API_KEY" ]; then
    echo "⚠️  Warning: Firebase environment variables not set"
    echo "📝 To enable Firebase in production:"
    echo "   1. Create a Firebase project at https://console.firebase.google.com/"
    echo "   2. Add the Firebase config to your .env file"
    echo "   3. Uncomment Firebase imports in FirebaseService.js"
    echo ""
    echo "🏗️  Continuing with Supabase-only deployment..."
fi

# Build the application
echo "🏗️  Building application for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if dist directory exists
    if [ -d "dist" ]; then
        echo "📦 Build output ready in 'dist' directory"
        
        # Deploy to GitHub Pages
        echo "🚀 Deploying to GitHub Pages..."
        npm run deploy
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Deployment successful!"
            echo ""
            echo "📊 Service Configuration:"
            if [ -z "$VITE_FIREBASE_API_KEY" ]; then
                echo "   • Primary: Supabase (Active)"
                echo "   • Backup: Firebase (Disabled - needs configuration)"
            else
                echo "   • Primary: Supabase (Active)"
                echo "   • Backup: Firebase (Active)"
            fi
            echo ""
            echo "🔗 Your application is available at:"
            echo "   https://gurukrpa.github.io/rule-1-rule-2-abcd-bcd-number/"
            echo ""
            echo "🧪 Test dual-service functionality at:"
            echo "   https://gurukrpa.github.io/rule-1-rule-2-abcd-bcd-number/dual-service-demo"
            echo ""
            
            # Show next steps
            if [ -z "$VITE_FIREBASE_API_KEY" ]; then
                echo "🔧 Next Steps (Optional):"
                echo "   1. Set up Firebase project (see FIREBASE-SETUP-GUIDE.md)"
                echo "   2. Add Firebase config to .env file"
                echo "   3. Redeploy to enable full dual-service mode"
            else
                echo "✅ All services configured and deployed!"
            fi
        else
            echo "❌ Deployment failed!"
            exit 1
        fi
    else
        echo "❌ Build directory 'dist' not found!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
