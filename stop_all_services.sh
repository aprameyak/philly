#!/bin/bash

echo "🛑 Stopping All PhilaWatch Services..."

# Kill processes on specific ports
echo "🔌 Stopping services on ports 8000, 8001, 8081..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:8001 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

# Kill any remaining Node.js processes
echo "🧹 Cleaning up Node.js processes..."
pkill -f "npm start" 2>/dev/null
pkill -f "expo start" 2>/dev/null

# Kill any remaining Python processes
echo "🐍 Cleaning up Python processes..."
pkill -f "uvicorn app:app" 2>/dev/null
pkill -f "python api.py" 2>/dev/null

sleep 2

echo "✅ All services stopped!"
echo "🔍 Checking for remaining processes..."
lsof -i :8000 -i :8001 -i :8081 2>/dev/null || echo "All ports are free"
