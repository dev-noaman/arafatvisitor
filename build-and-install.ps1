# Build React Native APK and install to connected Android device/emulator
# Usage: .\build-and-install.ps1

$ErrorActionPreference = "Stop"

# Set Java 17
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"

# Set Android SDK
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "Using Java:" -ForegroundColor Cyan
java -version

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$mobileDir = "$projectRoot\mobile"

# Install JS dependencies if needed
if (-not (Test-Path "$mobileDir\node_modules")) {
    Write-Host "`nInstalling npm dependencies..." -ForegroundColor Yellow
    Set-Location $mobileDir
    npm install
}

# Navigate to android folder
Set-Location "$mobileDir\android"

# Clean and build
Write-Host "`nCleaning previous build..." -ForegroundColor Yellow
.\gradlew clean

Write-Host "`nBuilding release APK..." -ForegroundColor Yellow
.\gradlew assembleRelease

$releaseDir = "$mobileDir\android\app\build\outputs\apk\release"
$apkPath = "$releaseDir\app-visitor.apk"
if (-not (Test-Path $apkPath)) {
    $apkPath = Get-ChildItem -Path $releaseDir -Filter "*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

if ($apkPath -and (Test-Path $apkPath)) {
    Write-Host "`nAPK built successfully: $apkPath" -ForegroundColor Green
    $size = [math]::Round((Get-Item $apkPath).Length / 1MB, 2)
    Write-Host "Size: ${size} MB" -ForegroundColor Cyan

    # Install to device/emulator
    Write-Host "`nInstalling to device..." -ForegroundColor Yellow
    adb install -r $apkPath

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nInstalled successfully!" -ForegroundColor Green

        # Launch the app
        Write-Host "Launching app..." -ForegroundColor Cyan
        adb shell am start -n com.arafat.visitor/.MainActivity
    } else {
        Write-Host "`nInstall failed. Make sure a device/emulator is connected (adb devices)." -ForegroundColor Red
    }
} else {
    Write-Host "`nAPK not found. Build may have failed." -ForegroundColor Red
}

Set-Location $projectRoot
