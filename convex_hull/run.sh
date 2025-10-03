#!/bin/bash

echo "🚀 Starting Convex Hull Visualizer..."
echo ""

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the convex_hull directory"
    exit 1
fi

# Check if Python dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    echo ""
fi

# Check if Node dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    cd frontend && npm install && cd ..
    echo ""
fi

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend (API folder)
echo "📦 Starting FastAPI backend on http://localhost:8000"
uvicorn API.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "📦 Starting React frontend on http://localhost:5173"
cd frontend && npm run dev &
FRONTEND_PID=$!

sleep 2

echo ""
echo "✅ Backend running (PID: $BACKEND_PID)"
echo "   📊 API docs: http://localhost:8000/docs"
echo ""
echo "✅ Frontend running (PID: $FRONTEND_PID)"
echo "   🌐 Open: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID

