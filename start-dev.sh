#!/bin/bash

# SwarmVille Development Startup Script

echo "======================================"
echo "  SwarmVille - Starting Development  "
echo "======================================"

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "Error: Please run this script from the swarmville root directory"
    exit 1
fi

# Start Backend
echo ""
echo "[1/2] Starting Backend (FastAPI)..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

source venv/Scripts/activate 2>/dev/null || source venv/bin/activate
pip install -q -r requirements.txt

# Start backend in background
uvicorn main:socket_app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo "Backend started on http://localhost:8000"

# Start Frontend
echo ""
echo "[2/2] Starting Frontend (Next.js)..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..

echo "Frontend starting on http://localhost:3000"

echo ""
echo "======================================"
echo "  SwarmVille is running!            "
echo "  Frontend: http://localhost:3000   "
echo "  Backend:  http://localhost:8000   "
echo "  API Docs: http://localhost:8000/docs"
echo "======================================"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
