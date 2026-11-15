@echo off
setlocal
title LifeOS Local Server

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js and npm are required to run LifeOS.
  echo Install the current LTS version from https://nodejs.org, then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\ws\package.json" (
  echo Installing LifeOS dependencies. This only happens the first time.
  call npm install
  if errorlevel 1 (
    echo.
    echo Installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo Starting LifeOS...
echo Open http://localhost:5173 in your browser when it is ready.
echo Keep this window open while using LifeOS. Press Ctrl+C to stop it.
echo.
call npm run dev

pause
