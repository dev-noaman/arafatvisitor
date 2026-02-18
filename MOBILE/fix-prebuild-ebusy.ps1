# Fix EBUSY when running expo prebuild
# IMPORTANT: Close Cursor completely first! Then:
#   Win+X -> Terminal (Admin) -> cd D:\Copy\ArafatVistor\mobile -> .\fix-prebuild-ebusy.ps1

$ErrorActionPreference = "Stop"
$mobileDir = $PSScriptRoot
$androidDir = "$mobileDir\android"
$androidBackup = "android_backup_$(Get-Date -Format 'yyyyMMdd_HHmm')"

Write-Host "1. Stopping Gradle daemon..." -ForegroundColor Yellow
if (Test-Path "$androidDir\gradlew.bat") {
    Push-Location $androidDir
    & .\gradlew.bat --stop 2>$null
    Pop-Location
    Start-Sleep -Seconds 2
}

Write-Host "2. Restarting Explorer (releases folder locks)..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Start-Process explorer
Start-Sleep -Seconds 3

Write-Host "3. Renaming android folder..." -ForegroundColor Yellow
if (Test-Path "$mobileDir\$androidBackup") { Remove-Item "$mobileDir\$androidBackup" -Recurse -Force -ErrorAction SilentlyContinue }
$renamed = $false
try {
    Rename-Item -Path $androidDir -NewName $androidBackup -Force
    $renamed = $true
} catch {
    Write-Host "   PowerShell Rename failed, trying cmd move..." -ForegroundColor Yellow
    $result = cmd /c "cd /d `"$mobileDir`" && move `"android`" `"$androidBackup`""
    if ($LASTEXITCODE -eq 0) { $renamed = $true }
}
if (-not $renamed) {
    Write-Host "`nFAILED: Cannot rename android folder." -ForegroundColor Red
    Write-Host "You must: 1) Close Cursor 2) Reboot PC 3) Run this script BEFORE opening any app" -ForegroundColor Yellow
    exit 1
}

Write-Host "4. Running expo prebuild..." -ForegroundColor Yellow
Push-Location $mobileDir
npx expo prebuild --platform android --clean
$ok = $LASTEXITCODE -eq 0
Pop-Location

if ($ok) {
    Write-Host "`nSuccess! Removing old android backup..." -ForegroundColor Green
    Remove-Item "$mobileDir\$androidBackup" -Recurse -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "`nPrebuild failed. Restoring android from backup..." -ForegroundColor Red
    if (Test-Path $androidDir) { Remove-Item $androidDir -Recurse -Force }
    Rename-Item "$mobileDir\$androidBackup" -NewName "android" -Force
}
