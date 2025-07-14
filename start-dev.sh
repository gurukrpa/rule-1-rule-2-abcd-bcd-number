#!/bin/bash

# Development server management script
# Always ensures localhost:5173 is available

echo "🚀 Starting development server on localhost:5173..."

# Check if port 5173 is in use
if lsof -i :5173 >/dev/null 2>&1; then
    echo "⚠️  Port 5173 is already in use. Attempting to free it..."
    
    # Kill any process using port 5173
    npx kill-port 5173
    
    # Wait a moment for the port to be freed
    sleep 2
    
    echo "✅ Port 5173 freed successfully"
else
    echo "✅ Port 5173 is available"
fi

# Start the development server
echo "🎯 Starting Vite development server..."
npm run dev

echo "🏁 Development server stopped"
