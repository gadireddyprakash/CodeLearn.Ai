@echo off
title CodeLearn App Launcher

echo ===================================
echo Starting CodeLearn...
echo ===================================

echo [1/4] Starting Backend Server...
start "CodeLearn Backend" cmd /k "cd backend && npm run dev"

echo [2/4] Starting Frontend Server...
start "CodeLearn Frontend" cmd /k "npm run dev"

echo [3/4] Setting up Android USB Port Forwarding...
"C:\Users\reddy\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000 2>nul

echo [4/4] Waiting for servers to initialize...
timeout /t 5 /nobreak > nul

echo Launching CodeLearn App...
:: Try launching in Edge (App Mode) first, fallback to Chrome (App Mode), fallback to default browser
start msedge --app="http://localhost:5173" 2>nul || start chrome --app="http://localhost:5173" 2>nul || start http://localhost:5173

echo ===================================
echo CodeLearn is now running!
echo Close this window at any time.
echo ===================================
timeout /t 5 > nul
