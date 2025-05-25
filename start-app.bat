@echo off
echo Starting application setup...

:: Install dependencies for backend
echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b %ERRORLEVEL%
)

:: Install dependencies for frontend
echo Installing frontend dependencies...
cd ../frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b %ERRORLEVEL%
)

:: Start backend server
echo Starting backend server...
start cmd /k "cd ../backend && npm run dev"

:: Wait a moment for backend to start
timeout /t 5 /nobreak

:: Start frontend
echo Starting frontend...
cd ../frontend
start cmd /k "npm start"

echo Application startup complete!
echo Backend is running on http://localhost:3000
echo Frontend will open in your browser
pause 