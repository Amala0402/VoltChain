Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "⚡ VOLTCHAIN: BLOCKCHAIN-BASED HOUSEHOLD ENERGY SHARING" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[*] Starting VoltChain Backend Server at http://localhost:3000..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
    node server.js
} else {
    Write-Host "[!] Node.js not detected. Opening website directly in browser..." -ForegroundColor Yellow
    Start-Process (Join-Path $PSScriptRoot "public\index.html")
}
