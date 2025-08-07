#!/bin/bash

# 🧹 Clean Debug Files Script
# This script moves debug HTML files out of the root directory
# to prevent Vite build issues

echo "🧹 Cleaning debug HTML files..."

# Create debug-files directory if it doesn't exist
mkdir -p debug-files

# Move all debug/test HTML files (except index.html)
find . -maxdepth 1 -name "*.html" ! -name "index.html" -exec mv {} debug-files/ \; 2>/dev/null

echo "✅ Debug files moved to debug-files/ directory"
echo "📁 Only index.html remains in root directory"
echo ""
echo "🎯 This prevents Vite from processing debug files as entry points"
echo "🔧 Your CSS/styling will now work correctly"
