@echo off
:: This script runs hidden via share.vbs - no terminal windows visible

set PATH=C:\Program Files\nodejs;%PATH%
set SCRIPT_DIR=%~dp0

:: Kill previous instances
taskkill /F /IM cloudflared.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING" 2^>nul') do taskkill /PID %%a /T /F >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start backend hidden
cd /d "%SCRIPT_DIR%apps\backend"
start /b "" npm run dev >nul 2>&1

:: Wait for backend
timeout /t 5 /nobreak >nul

:: Start cloudflared, capture URL
set CF_PATH=%LOCALAPPDATA%\Microsoft\WinGet\Links\cloudflared.exe
start /b "" "%CF_PATH%" tunnel --url http://localhost:3001 2>"%SCRIPT_DIR%tunnel_log.txt"

:: Wait for tunnel URL
timeout /t 12 /nobreak >nul

:: Extract URL and write to link file
for /f "tokens=*" %%a in ('findstr "trycloudflare.com" "%SCRIPT_DIR%tunnel_log.txt" 2^>nul') do (
    echo %%a > "%SCRIPT_DIR%LINK.txt"
)

:: Open the link file for user
start "" notepad "%SCRIPT_DIR%LINK.txt"
