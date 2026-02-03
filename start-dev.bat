@echo off
REM SwarmVille Development Startup Script for Windows

echo ======================================
echo   SwarmVille - Starting Development
echo ======================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo Error: Please run this script from the swarmville root directory
    exit /b 1
)

echo.
echo [1/2] Starting Backend (FastAPI)...
cd backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -q -r requirements.txt

REM Start backend in new window
start "SwarmVille Backend" cmd /k "venv\Scripts\activate.bat && uvicorn main:socket_app --reload --host 0.0.0.0 --port 8000"
cd ..

echo Backend started on http://localhost:8000

echo.
echo [2/2] Starting Frontend (Next.js)...
cd frontend

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

REM Start frontend in new window
start "SwarmVille Frontend" cmd /k "npm run dev"
cd ..

echo Frontend starting on http://localhost:3000

echo.
echo ======================================
echo   SwarmVille is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ======================================
echo.
echo Close the terminal windows to stop the services.

pause
