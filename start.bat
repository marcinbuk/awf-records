@echo off
echo ===================================================
echo  AWF Records System - Uruchamianie
echo ===================================================

:: Set Node.js path
set PATH=C:\Program Files\nodejs;%PATH%

:: Check if .env exists
if not exist "apps\backend\.env" (
  echo [WARN] Brak pliku .env! Kopiowanie z .env.example...
  copy "apps\backend\.env.example" "apps\backend\.env"
  echo [INFO] Uzupelnij plik apps\backend\.env przed uruchomieniem!
  pause
)

:: Install all deps if node_modules missing
if not exist "node_modules" (
  echo [INFO] Instalowanie zaleznosci [root]...
  npm install
)
if not exist "packages\shared\node_modules" (
  echo [INFO] Instalowanie zaleznosci [shared]...
  cd packages\shared && npm install && cd ..\..
)
if not exist "apps\backend\node_modules" (
  echo [INFO] Instalowanie zaleznosci [backend]...
  cd apps\backend && npm install && cd ..\..
)
if not exist "apps\frontend\node_modules" (
  echo [INFO] Instalowanie zaleznosci [frontend]...
  cd apps\frontend && npm install && cd ..\..
)

echo.
echo [INFO] Uruchamianie backendu na porcie 3001...
start "AWF Backend" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd apps\backend && npm run dev"

echo [INFO] Czekam 3 sekundy...
timeout /t 3 /nobreak > nul

echo [INFO] Uruchamianie frontendu na porcie 5173...
start "AWF Frontend" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd apps\frontend && npm run dev"

echo.
echo ===================================================
echo  Aplikacja dostepna pod adresem:
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3001
echo  Dane:     admin@awf.edu.pl / Admin123!
echo ===================================================
pause
