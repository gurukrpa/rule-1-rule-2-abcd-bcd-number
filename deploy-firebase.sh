#!/bin/bash

echo "🔥 Deploying to Firebase Hosting (viboothi.in)..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase..."
    firebase login
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site is live at: https://viboothi.in"
    echo "🔧 Firebase console: https://console.firebase.google.com/project/viboothi-a9dcd/hosting"
    echo "⚡ Deployment time: ~30 seconds to 2 minutes"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
