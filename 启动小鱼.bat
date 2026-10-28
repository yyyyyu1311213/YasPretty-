@echo off
setlocal
cd /d "%~dp0"
title YasPretty with XiaoY

where node >nul 2>nul
if errorlevel 1 goto useSystem
npm run dev
goto done

:useSystem
if not exist "C:\Program Files\nodejs\node.exe" goto noNode
"C:\Program Files\nodejs\npm.cmd" run dev
goto done

:noNode
echo.
echo [!] Node.js not found. Please install Node.js 18+ first.
echo     Download: https://nodejs.org/
echo.
pause
exit /b 1

:done
echo.
echo Server stopped. Press any key to close.
pause >nul
