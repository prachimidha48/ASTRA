Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  ASTRA - Astronaut Health Intelligence System" -ForegroundColor White
Write-Host "  NASA Space Apps Challenge 2026" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

Write-Host "`nStarting FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; uvicorn main:app --host 127.0.0.1 --port 8000"

Write-Host "Starting React Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Start-Sleep -Seconds 2
Write-Host "`nASTRA Application online at http://localhost:5173" -ForegroundColor Green
Start-Process "http://localhost:5173"

