#!/bin/bash

# Port 5173 status checker and manager

echo "🔍 Checking port 5173 status..."

if lsof -i :5173 >/dev/null 2>&1; then
    echo "⚠️  Port 5173 is in use:"
    echo ""
    lsof -i :5173
    echo ""
    echo "To kill all processes using port 5173, run:"
    echo "  npx kill-port 5173"
    echo "  # or"
    echo "  npm run dev:force"
else
    echo "✅ Port 5173 is available and ready to use"
    echo ""
    echo "You can start the development server with:"
    echo "  npm run dev"
    echo "  # or"
    echo "  ./start-dev.sh"
fi
