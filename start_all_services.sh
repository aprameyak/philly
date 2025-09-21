#!/bin/bash

echo "🚀 Starting All Services for PhilaWatch App..."

# Kill any existing processes on the ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:8001 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

# Start AuthAPI (User management, reports, leaderboard)
echo "🔐 Starting AuthAPI on port 8000..."
cd authapi && source venv/bin/activate && python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
AUTH_PID=$!

# Start dbapi (Real crime data with Cerebras AI scoring)
echo "📊 Starting dbapi on port 8001..."
cd ../dbapi && source venv/bin/activate && python api.py &
DB_PID=$!

# Wait for APIs to start
echo "⏳ Waiting for APIs to start..."
sleep 5

# Test APIs
echo "🧪 Testing APIs..."
echo "AuthAPI: $(curl -s http://localhost:8000/leaderboard | jq 'length' 2>/dev/null || echo 'Not ready') users"
echo "dbapi: $(curl -s http://localhost:8001/crime | jq 'length' 2>/dev/null || echo 'Not ready') crime records"

# Start Frontend
echo "📱 Starting Frontend on port 8081..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo "🔗 URLs:"
echo "   - Frontend: http://localhost:8081"
echo "   - AuthAPI: http://localhost:8000"
echo "   - dbapi: http://localhost:8001"
echo ""
echo "📊 Real crime data is now being served from Philadelphia OpenDataPhilly"
echo "🤖 AI scoring is using your Cerebras API key"
echo ""
echo "🛑 To stop all services: ./stop_all_services.sh"
echo "📝 Check logs in terminal for any issues"

# Keep script running
wait
