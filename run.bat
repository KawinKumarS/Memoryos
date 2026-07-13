@echo off
echo ==========================================
echo           MEMORYOS PROTOCOL RUNNER
echo ==========================================
echo.
echo Launching SQLite Database Synaptic Core API (FastAPI)...
start cmd /k "title MemoryOS Backend API && cd backend && uvicorn app.main:app --reload --port 8000"

echo Launching Glassmorphic User Interface (Vite React)...
cd frontend && npm run dev
echo.
pause
