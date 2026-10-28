@echo off
setlocal
cd /d "%~dp0"
title YasPretty with XiaoY

where npm >nul 2>nul
if errorlevel 1 goto noNode

start "YasPretty Dev Server" cmd /k npm run dev
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5174/"
exit /b 0

:noNode
echo.
echo [!] Node.js was not found. Install Node.js 18+ first.
echo     https://nodejs.org/
echo.
pause
exit /b 1

