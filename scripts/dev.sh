#!/bin/bash

# Figma Studio AI - Development Mode Startup Script
# Starts all services in development mode

set -e

echo "🚀 Starting Figma Studio AI in Development Mode..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}⚠️  Yarn not found. Installing Yarn...${NC}"
    npm install -g yarn
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Check environment variables
echo -e "${BLUE}Checking environment variables...${NC}"

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f .env.example ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please configure your API keys in .env before continuing${NC}"
        exit 1
    else
        echo -e "${YELLOW}⚠️  Please create .env file with your API keys${NC}"
        exit 1
    fi
fi

source .env

if [ -z "$FIGMA_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  FIGMA_TOKEN not set in .env${NC}"
fi

if [ -z "$GROQ_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  GROQ_API_KEY not set in .env${NC}"
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
yarn install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build packages
echo -e "${BLUE}Building packages...${NC}"
yarn build
echo -e "${GREEN}✓ Packages built${NC}"
echo ""

# Start services
echo -e "${BLUE}Starting services...${NC}"
echo ""

# Kill any existing processes on our ports
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true  # IDE
lsof -ti:3001 | xargs kill -9 2>/dev/null || true  # AI Engine
lsof -ti:3002 | xargs kill -9 2>/dev/null || true  # Preview Server

# Create log directory
mkdir -p logs

# Start services in background
echo -e "${GREEN}Starting Preview Server (port 3002)...${NC}"
cd preview-server && yarn dev > ../logs/preview-server.log 2>&1 &
PREVIEW_PID=$!
cd ..

sleep 2

echo -e "${GREEN}Starting AI Engine (port 3001)...${NC}"
cd ai-engine && yarn dev > ../logs/ai-engine.log 2>&1 &
AI_PID=$!
cd ..

sleep 2

echo -e "${GREEN}Starting IDE (port 3000)...${NC}"
cd ide-app && yarn start > ../logs/ide.log 2>&1 &
IDE_PID=$!
cd ..

# Save PIDs for cleanup
echo $PREVIEW_PID > logs/preview.pid
echo $AI_PID > logs/ai.pid
echo $IDE_PID > logs/ide.pid

echo ""
echo -e "${GREEN}✨ All services started!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🌐 IDE:${NC}             http://localhost:3000"
echo -e "${BLUE}🤖 AI Engine:${NC}       http://localhost:3001"
echo -e "${BLUE}📱 Preview Server:${NC}  http://localhost:3002"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Preview: tail -f logs/preview-server.log"
echo "  AI:      tail -f logs/ai-engine.log"
echo "  IDE:     tail -f logs/ide.log"
echo ""
echo -e "${YELLOW}To stop all services:${NC}"
echo "  ./scripts/stop.sh"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait and handle shutdown
trap 'echo ""; echo "Shutting down..."; kill $PREVIEW_PID $AI_PID $IDE_PID 2>/dev/null; exit 0' INT TERM

# Keep script running
wait
