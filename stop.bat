@echo off
:: Zatrzymaj wszystko (wywoływany przez stop.vbs)
taskkill /F /IM cloudflared.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING" 2^>nul') do taskkill /PID %%a /T /F >nul 2>&1
