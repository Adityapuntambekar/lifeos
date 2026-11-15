@echo off
setlocal
title LifeOS Shared Study Garden
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 or newer, then try again.
  pause
  exit /b 1
)
call npm install --no-audit --no-fund
if errorlevel 1 (
  pause
  exit /b 1
)
echo Share the Network URL printed below, not localhost.
echo Keep this window open. Press Ctrl+C to stop sharing.
call npm run dev:lan
pause
