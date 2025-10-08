#!/bin/bash

if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "Error: Python is not installed"
    exit 1
fi

PYTHON_CMD=$(command -v python3 || command -v python)

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

if ! $PYTHON_CMD -c "import fastapi" 2>/dev/null; then
    echo "Installing Python dependencies..."
    $PYTHON_CMD -m pip install -r requirements.txt
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing Node dependencies..."
    cd frontend && npm install && cd ..
fi

cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting backend on http://localhost:8000"
$PYTHON_CMD -m uvicorn API.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 2

echo "Starting frontend on http://localhost:5173"
cd frontend && npm run dev &
FRONTEND_PID=$!

sleep 1

echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"

wait $BACKEND_PID $FRONTEND_PID
