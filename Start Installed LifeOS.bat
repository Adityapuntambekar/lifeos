@echo off
setlocal
title LifeOS Installed App Server
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 24 LTS from https://nodejs.org first.
 pause
 exit /b 1
)
if not exist node_modules\ws\package.json (
 call npm ci
 if errorlevel 1 exit /b 1
)
call npm run build
if errorlevel 1 (
 pause
 exit /b 1
)
set PORT=5173
echo Open http://localhost:5173 then Settings to install LifeOS.
echo Stop any other LifeOS server on port 5173 first.
echo Offline trackers work after setup. Shared rooms need this server running.
call npm run space:serve
pause
