@echo off
setlocal
cd /d "%~dp0"
title YasPretty with XiaoY

where npm >nul 2>nul
if errorlevel 1 goto noNode

start "YasPretty Dev Server" cmd /k npm run dev

set /a waitCount=0
:waitForWeb
powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:5174/'; if ($response.StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>nul
if not errorlevel 1 goto openWeb
set /a waitCount+=1
if %waitCount% geq 30 goto openWeb
ping 127.0.0.1 -n 2 >nul
goto waitForWeb

:openWeb
start "" "http://127.0.0.1:5174/"
exit /b 0

:noNode
echo.
echo [!] Node.js was not found. Install Node.js 18+ first.
echo     https://nodejs.org/
echo.
pause
exit /b 1

