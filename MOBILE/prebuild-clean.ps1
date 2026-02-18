# Run expo prebuild --clean (fixes EBUSY by stopping Gradle first)
# Usage: .\prebuild-clean.ps1
#
# If EBUSY persists: Close Cursor, open a NEW PowerShell, cd to mobile, run this script.

$ErrorActionPreference = "Stop"
$mobileDir = $PSScriptRoot

# 1. Stop Gradle daemon to release locked build files
$gradlew = Get-ChildItem -Path "$mobileDir\android" -Filter "gradlew*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($gradlew) {
    Write-Host "Stopping Gradle daemon..." -ForegroundColor Yellow
    & $gradlew.FullName --stop 2>$null
    Start-Sleep -Seconds 3
}

# 2. Run prebuild --clean
Write-Host "Running expo prebuild --platform android --clean..." -ForegroundColor Yellow
try {
    npx expo prebuild --platform android --clean
} catch {
    Write-Host "`nIf you see EBUSY: Close Cursor IDE, open a NEW PowerShell window, then run:" -ForegroundColor Red
    Write-Host "  cd $mobileDir" -ForegroundColor Cyan
    Write-Host "  .\prebuild-clean.ps1" -ForegroundColor Cyan
    Write-Host "`nOr try without --clean (overwrites in place):" -ForegroundColor Yellow
    Write-Host "  npx expo prebuild --platform android" -ForegroundColor Cyan
    throw
}
