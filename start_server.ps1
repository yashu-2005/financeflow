# Personal Finance & Expense Analyzer - Server Launcher Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Personal Finance & Expense Analyzer Server..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check for existing process listening on port 8080 and stop it
$existingConnection = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($existingConnection) {
    $pidToKill = $existingConnection.OwningProcess | Select-Object -First 1
    if ($pidToKill -and $pidToKill -gt 0) {
        Write-Host "Freeing Port 8080 (Stopping PID: $pidToKill)..." -ForegroundColor Yellow
        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

# 2. Add Maven to Environment PATH
$env:PATH += ";C:\Users\yasas\AppData\Local\Temp\apache-maven\apache-maven-3.9.6\bin"

# 3. Launch Spring Boot Server
Write-Host "Launching Spring Boot Server on http://localhost:8080 ..." -ForegroundColor Green
mvn spring-boot:run
