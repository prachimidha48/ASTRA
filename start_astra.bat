@echo off
echo ======================================================================
echo   ASTRA - Astronaut Health Intelligence System
echo   NASA Space Apps Challenge 2026
echo ======================================================================
echo.
echo Starting FastAPI Backend (Port 8000)...
start "ASTRA Backend" cmd /k "cd backend && uvicorn main:app --host 127.0.0.1 --port 8000"

echo Starting React Vite Frontend (Port 5173)...
start "ASTRA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ASTRA System is launching!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo.
timeout /t 3 >nul
start http://localhost:5173

