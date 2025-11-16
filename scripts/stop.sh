#!/bin/bash

# Figma Studio AI - Stop All Services

echo "🛑 Stopping Figma Studio AI services..."

# Kill processes by PID if available
if [ -f logs/preview.pid ]; then
    kill $(cat logs/preview.pid) 2>/dev/null && echo "✓ Preview Server stopped"
    rm logs/preview.pid
fi

if [ -f logs/ai.pid ]; then
    kill $(cat logs/ai.pid) 2>/dev/null && echo "✓ AI Engine stopped"
    rm logs/ai.pid
fi

if [ -f logs/ide.pid ]; then
    kill $(cat logs/ide.pid) 2>/dev/null && echo "✓ IDE stopped"
    rm logs/ide.pid
fi

# Cleanup ports
echo "Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

echo ""
echo "✨ All services stopped"
