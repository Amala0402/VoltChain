@echo off
title VoltChain - Blockchain Energy Sharing Platform
echo ======================================================
echo ⚡ VOLTCHAIN: BLOCKCHAIN-BASED HOUSEHOLD ENERGY SHARING
echo ======================================================
echo.
echo Checking Node.js installation...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js not detected in PATH.
    echo [*] Opening website directly in your default browser...
    start "" "%~dp0public\index.html"
    pause
    exit /b
)

echo [*] Starting VoltChain Backend Server...
start "" http://localhost:3000
node server.js
pause
