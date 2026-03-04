# AWF Records - Uruchom w tle
# Kliknij prawym przyciskiem -> "Uruchom za pomoca programu PowerShell"
# Lub odpal share.vbs

$ErrorActionPreference = "SilentlyContinue"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:PATH = "C:\Program Files\nodejs;$env:PATH"

Write-Host "=== AWF Records - Uruchamianie ===" -ForegroundColor Cyan

# Stop previous
Write-Host "[1/4] Zatrzymywanie poprzednich instancji..." -ForegroundColor Yellow
taskkill /F /IM cloudflared.exe 2>$null | Out-Null
$listening = netstat -ano | Select-String ":3001.*LISTENING"
foreach ($line in $listening) {
    $pid_val = ($line.ToString().Trim() -split '\s+')[-1]
    taskkill /PID $pid_val /T /F 2>$null | Out-Null
}
Start-Sleep -Seconds 2

# Start backend
Write-Host "[2/4] Uruchamianie backendu..." -ForegroundColor Yellow
$backendDir = Join-Path $projectDir "apps\backend"
$backendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru
Write-Host "       Backend PID: $($backendProc.Id)" -ForegroundColor DarkGray

# Wait for backend
Write-Host "[3/4] Czekam na backend (5s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "       Backend OK (status: $($response.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Host "       Backend jeszcze startuje, czekam..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds 5
}

# Start cloudflared
Write-Host "[4/4] Uruchamianie tunelu..." -ForegroundColor Yellow
$cfPath = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\cloudflared.exe"
$logFile = Join-Path $projectDir "tunnel_log.txt"

# Remove old log
Remove-Item $logFile -Force 2>$null

$cfProc = Start-Process -FilePath $cfPath -ArgumentList "tunnel", "--url", "http://localhost:3001" -WindowStyle Hidden -RedirectStandardError $logFile -PassThru
Write-Host "       Cloudflared PID: $($cfProc.Id)" -ForegroundColor DarkGray

# Wait for tunnel URL
Write-Host ""
Write-Host "Czekam na publiczny link..." -ForegroundColor Cyan
$url = ""
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        if ($content -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
            $url = $Matches[1]
            break
        }
    }
    Write-Host "." -NoNewline
}
Write-Host ""

if ($url) {
    # Save URL
    $url | Out-File (Join-Path $projectDir "LINK.txt") -Encoding utf8

    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  LINK DO UDOSTEPNIENIA:" -ForegroundColor White
    Write-Host ""
    Write-Host "  $url" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Wpisz ten adres na telefonie lub wyslij znajomemu!" -ForegroundColor White
    Write-Host ""
    Write-Host "  Aby zatrzymac: kliknij 2x stop.vbs" -ForegroundColor DarkGray
    Write-Host "  lub uruchom: stop.bat" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Green
}
else {
    Write-Host "BLAD: Nie udalo sie uzyskac linku!" -ForegroundColor Red
    Write-Host "Sprawdz tunnel_log.txt" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Nacisnij dowolny klawisz aby zamknac to okno..." -ForegroundColor DarkGray
Write-Host "(Serwer dalej dziala w tle!)" -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
