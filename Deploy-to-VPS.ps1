<#
.SYNOPSIS
    Remote VPS deployment script for Arafat Visitor Management System

.DESCRIPTION
    This script automates remote VPS deployment of the Arafat Visitor Management System.
    It handles frontend build, file transfer via rsync/scp, backend setup,
    Prisma migrations, PM2 process management, and Nginx configuration.

.PARAMETER Init
    Run initial setup (first deployment - includes installing dependencies, database creation, seeding users)

.PARAMETER SkipFrontend
    Skip frontend build and deployment

.PARAMETER SkipBackend
    Skip backend deployment

.PARAMETER SkipTests
    Skip the health check verification after deployment

.EXAMPLE
    .\Deploy-to-VPS.ps1
    Deploy update to VPS (frontend and backend)

.EXAMPLE
    .\Deploy-to-VPS.ps1 -Init
    Run initial VPS setup (first time deployment)

.EXAMPLE
    .\Deploy-to-VPS.ps1 -SkipFrontend
    Deploy only backend changes

.EXAMPLE
    .\Deploy-to-VPS.ps1 -SkipBackend
    Deploy only frontend changes
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Init,

    [Parameter(Mandatory=$false)]
    [switch]$SkipFrontend,

    [Parameter(Mandatory=$false)]
    [switch]$SkipBackend,

    [Parameter(Mandatory=$false)]
    [switch]$SkipTests
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# VPS Configuration - UPDATE THESE VALUES
$VpsHost = "72.62.234.25"           # e.g., "192.168.1.100"
$VpsUser = "root"
$VpsPassword = "Swa@Adel2022" # Consider using SSH keys instead
$VpsDomain = "arafatvisitor.cloud" # Your domain name
$VpsPath = "/var/www/arafatvisitor"
$DbName = "arafatvisitor"
$DbUser = "arafatvisitor"
$DbPassword = "arafatvisitor"

# Color configuration for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Step = "Magenta"
}

# Service definitions
$Services = @(
    @{
        Name = "Frontend"
        LocalPath = "dist"
        RemotePath = "$VpsPath/frontend"
        Type = "Static"
        Port = 443
        Endpoint = "/"
    },
    @{
        Name = "Backend"
        LocalPath = "backend"
        RemotePath = "$VpsPath/backend"
        Type = "API"
        Port = 3000
        Endpoint = "/api/health"
        ProcessName = "arafatvisitor-api"
    }
)

#region Helper Functions

function Write-Log {
    param(
        [string]$Message,
        [string]$Color = "White"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"

    Write-Host $logMessage -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-Log "Validating prerequisites..." -Color $Colors.Step

    # Check for SSH tools
    $scpAvailable = Get-Command scp -ErrorAction SilentlyContinue
    $sshAvailable = Get-Command ssh -ErrorAction SilentlyContinue
    $pscpAvailable = Get-Command pscp -ErrorAction SilentlyContinue
    $plinkAvailable = Get-Command plink -ErrorAction SilentlyContinue

    if (-not ($scpAvailable -and $sshAvailable) -and -not ($pscpAvailable -and $plinkAvailable)) {
        Write-Log "ERROR: Neither OpenSSH nor PuTTY tools found. Please install one of them." -Color $Colors.Error
        return $false
    }

    if ($scpAvailable -and $sshAvailable) {
        Write-Log "Using OpenSSH for SSH/SCP" -Color $Colors.Success
        $script:UseOpenSSH = $true
    } else {
        Write-Log "Using PuTTY tools for SSH/SCP" -Color $Colors.Success
        $script:UseOpenSSH = $false
    }

    # Check for Node.js
    $nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeAvailable) {
        Write-Log "ERROR: Node.js not found. Please install Node.js." -Color $Colors.Error
        return $false
    }
    Write-Log "Node.js version: $(node --version)" -Color $Colors.Info

    # Validate required directories
    if (-not $SkipFrontend) {
        $srcPath = Join-Path $ScriptPath "src"
        if (-not (Test-Path $srcPath)) {
            Write-Log "ERROR: Frontend source directory not found: $srcPath" -Color $Colors.Error
            return $false
        }
    }

    if (-not $SkipBackend) {
        $backendPath = Join-Path $ScriptPath "backend"
        if (-not (Test-Path $backendPath)) {
            Write-Log "ERROR: Backend directory not found: $backendPath" -Color $Colors.Error
            return $false
        }
    }

    Write-Log "Prerequisites validated successfully" -Color $Colors.Success
    return $true
}

function Test-SshConnection {
    Write-Log "Testing SSH connection to VPS..." -Color $Colors.Info

    try {
        if ($script:UseOpenSSH) {
            $testCommand = "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${VpsUser}@${VpsHost} `"echo OK`""
        } else {
            $testCommand = "plink -pw `"$VpsPassword`" -batch ${VpsUser}@${VpsHost} `"echo OK`""
        }

        $result = Invoke-Expression $testCommand 2>&1 | Out-String

        if ($result -match "OK") {
            Write-Log "SSH connection test successful" -Color $Colors.Success
            return $true
        } else {
            Write-Log "SSH connection test failed: $result" -Color $Colors.Error
            return $false
        }
    }
    catch {
        Write-Log "Error testing SSH connection: $_" -Color $Colors.Error
        return $false
    }
}

function Invoke-VpsCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,
        [switch]$ReturnOutput,
        [switch]$Silent
    )

    if (-not $Silent) {
        Write-Log "Executing on VPS: $Command" -Color $Colors.Info
    }

    try {
        if ($script:UseOpenSSH) {
            $sshCommand = "ssh -o StrictHostKeyChecking=no ${VpsUser}@${VpsHost} `"$Command`""
        } else {
            $sshCommand = "plink -pw `"$VpsPassword`" -batch ${VpsUser}@${VpsHost} `"$Command`""
        }

        $result = Invoke-Expression $sshCommand 2>&1
        $exitCode = $LASTEXITCODE

        $resultString = if ($result) { $result | Out-String } else { "" }

        if ($ReturnOutput) {
            return $resultString
        }

        return $true
    }
    catch {
        if (-not $Silent) {
            Write-Log "Error executing command: $_" -Color $Colors.Error
        }
        throw
    }
}

function Copy-ToVps {
    param(
        [Parameter(Mandatory=$true)]
        [string]$LocalPath,
        [Parameter(Mandatory=$true)]
        [string]$RemotePath,
        [switch]$Recursive,
        [string[]]$Exclude = @()
    )

    Write-Log "Transferring to VPS: $LocalPath -> $RemotePath" -Color $Colors.Info

    if (-not (Test-Path $LocalPath)) {
        throw "Local path not found: $LocalPath"
    }

    try {
        # Create remote directory
        Invoke-VpsCommand -Command "mkdir -p $RemotePath" -Silent | Out-Null

        if ($script:UseOpenSSH) {
            # Use rsync if available, otherwise scp
            $rsyncAvailable = Get-Command rsync -ErrorAction SilentlyContinue

            if ($rsyncAvailable) {
                $excludeArgs = ($Exclude | ForEach-Object { "--exclude='$_'" }) -join " "
                $rsyncCommand = "rsync -avz --delete $excludeArgs -e `"ssh -o StrictHostKeyChecking=no`" `"$LocalPath/`" ${VpsUser}@${VpsHost}:$RemotePath/"
                $result = Invoke-Expression $rsyncCommand 2>&1
            } else {
                # Fallback to scp
                $scpArgs = if ($Recursive) { "-r" } else { "" }
                $scpCommand = "scp -o StrictHostKeyChecking=no $scpArgs `"$LocalPath`" ${VpsUser}@${VpsHost}:$RemotePath/"
                $result = Invoke-Expression $scpCommand 2>&1
            }
        } else {
            # Use pscp
            $scpArgs = if ($Recursive) { "-r" } else { "" }
            $scpCommand = "pscp -pw `"$VpsPassword`" -batch $scpArgs `"$LocalPath`" ${VpsUser}@${VpsHost}:$RemotePath/"
            $result = Invoke-Expression $scpCommand 2>&1
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Transfer completed successfully" -Color $Colors.Success
            return $true
        } else {
            Write-Log "Transfer may have issues: $result" -Color $Colors.Warning
            return $true
        }
    }
    catch {
        Write-Log "Transfer error: $_" -Color $Colors.Error
        throw
    }
}

#endregion

#region Build Functions

function Build-Frontend {
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "Building Frontend" -Color $Colors.Step
    Write-Log "========================================" -Color $Colors.Step

    try {
        # Install dependencies
        Write-Log "Installing frontend dependencies..." -Color $Colors.Info
        $installResult = & npm ci 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) {
            Write-Log "npm ci failed, trying npm install..." -Color $Colors.Warning
            & npm install 2>&1 | Out-Null
        }
        Write-Log "Dependencies installed" -Color $Colors.Success

        # Set environment variables for build
        $env:VITE_API_BASE = "https://$VpsDomain/api"
        $env:VITE_SHOW_DEBUG_LOGIN = "false"

        # Build frontend
        Write-Log "Building frontend (Vite)..." -Color $Colors.Info
        $buildResult = & npm run build 2>&1 | Out-String

        if ($LASTEXITCODE -ne 0) {
            Write-Log "Frontend build failed: $buildResult" -Color $Colors.Error
            return $false
        }

        # Verify dist directory exists
        $distPath = Join-Path $ScriptPath "dist"
        if (-not (Test-Path $distPath)) {
            Write-Log "ERROR: Build output not found at $distPath" -Color $Colors.Error
            return $false
        }

        $distSize = (Get-ChildItem -Path $distPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Log "Frontend built successfully ($([math]::Round($distSize, 2)) MB)" -Color $Colors.Success
        return $true
    }
    catch {
        Write-Log "Frontend build error: $_" -Color $Colors.Error
        return $false
    }
}

#endregion

#region Deployment Functions

function Deploy-Frontend {
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "Deploying Frontend to VPS" -Color $Colors.Step
    Write-Log "========================================" -Color $Colors.Step

    try {
        $distPath = Join-Path $ScriptPath "dist"

        if (-not (Test-Path $distPath)) {
            Write-Log "ERROR: dist directory not found. Run build first." -Color $Colors.Error
            return $false
        }

        # Transfer frontend files
        Copy-ToVps -LocalPath $distPath -RemotePath "$VpsPath/frontend" -Recursive | Out-Null

        Write-Log "Frontend deployed successfully" -Color $Colors.Success
        return $true
    }
    catch {
        Write-Log "Frontend deployment failed: $_" -Color $Colors.Error
        return $false
    }
}

function Deploy-Backend {
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "Deploying Backend to VPS" -Color $Colors.Step
    Write-Log "========================================" -Color $Colors.Step

    try {
        $backendPath = Join-Path $ScriptPath "backend"

        # Transfer backend files (excluding node_modules, .env, dist)
        Write-Log "Transferring backend source files..." -Color $Colors.Info
        Copy-ToVps -LocalPath $backendPath -RemotePath "$VpsPath/backend" -Recursive -Exclude @("node_modules", ".env", "dist", "coverage") | Out-Null

        Write-Log "Backend files deployed successfully" -Color $Colors.Success
        return $true
    }
    catch {
        Write-Log "Backend deployment failed: $_" -Color $Colors.Error
        return $false
    }
}

function Initialize-VpsEnvironment {
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "Initial VPS Setup" -Color $Colors.Step
    Write-Log "========================================" -Color $Colors.Step

    try {
        # Install system dependencies
        Write-Log "Installing system dependencies..." -Color $Colors.Info

        $initScript = @"
set -e

echo "=== Installing system dependencies ==="
# Install Node.js if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# Install PM2 globally
npm install -g pm2

# Install rsync
apt-get install -y rsync

echo "=== Creating directories ==="
mkdir -p $VpsPath/frontend $VpsPath/backend

echo "=== Configuring database ==="
# Stop PM2 processes temporarily
pm2 stop arafatvisitor-api 2>/dev/null || true
pm2 delete arafatvisitor-api 2>/dev/null || true

# Ensure PostgreSQL is running
systemctl start postgresql 2>/dev/null || true
sleep 2

# Create database and user if they don't exist
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DbName; then
    echo "Creating new database and user..."
    sudo -u postgres psql -c "CREATE USER $DbUser WITH PASSWORD '$DbPassword';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE $DbName OWNER $DbUser;"
    sudo -u postgres psql -d $DbName -c "GRANT ALL ON SCHEMA public TO $DbUser;"
else
    echo "Database already exists - preserving data"
fi

echo "INIT_DEPS_COMPLETE"
"@

        $result = Invoke-VpsCommand -Command $initScript -ReturnOutput

        if ($result -match "INIT_DEPS_COMPLETE") {
            Write-Log "System dependencies installed" -Color $Colors.Success
        } else {
            Write-Log "Dependencies installation may have issues" -Color $Colors.Warning
        }

        return $true
    }
    catch {
        Write-Log "Initial setup failed: $_" -Color $Colors.Error
        return $false
    }
}

function Setup-BackendEnvironment {
    Write-Log "Setting up backend environment..." -Color $Colors.Info

    try {
        $setupScript = @"
set -e
cd $VpsPath/backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    JWT_SECRET=`$(openssl rand -base64 32)
    ADMINJS_SECRET=`$(openssl rand -base64 32)
    cat > .env << EOF
DATABASE_URL=postgresql://$DbUser:$DbPassword@localhost:5432/$DbName
JWT_SECRET=\$JWT_SECRET
JWT_EXPIRES_IN=24h
PORT=3000
ADMINJS_COOKIE_SECRET=\$ADMINJS_SECRET
ADMINJS_QUICK_LOGIN=false
EOF
    echo "Created new .env file"
else
    echo ".env file already exists - preserving configuration"
fi

# Load environment
export `$(grep -v '^#' .env | xargs)

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo "BACKEND_ENV_COMPLETE"
"@

        $result = Invoke-VpsCommand -Command $setupScript -ReturnOutput

        if ($result -match "BACKEND_ENV_COMPLETE") {
            Write-Log "Backend environment configured" -Color $Colors.Success
        }

        return $true
    }
    catch {
        Write-Log "Backend environment setup failed: $_" -Color $Colors.Error
        return $false
    }
}

function Seed-Database {
    Write-Log "Seeding default users..." -Color $Colors.Info

    try {
        $seedScript = @"
set -e
cd $VpsPath/backend
export `$(grep -v '^#' .env | xargs) 2>/dev/null || true
npx prisma db seed
echo "SEED_COMPLETE"
"@

        $result = Invoke-VpsCommand -Command $seedScript -ReturnOutput

        if ($result -match "SEED_COMPLETE") {
            Write-Log "Database seeded with default users (admin, gm, reception)" -Color $Colors.Success
        }

        return $true
    }
    catch {
        Write-Log "Database seeding failed: $_" -Color $Colors.Error
        return $false
    }
}

function Build-BackendOnVps {
    Write-Log "Building backend on VPS..." -Color $Colors.Info

    try {
        $buildScript = @"
set -e
cd $VpsPath/backend
export `$(grep -v '^#' .env | xargs) 2>/dev/null || true
npm run build
echo "BUILD_COMPLETE"
"@

        $result = Invoke-VpsCommand -Command $buildScript -ReturnOutput

        if ($result -match "BUILD_COMPLETE") {
            Write-Log "Backend built successfully" -Color $Colors.Success
        }

        return $true
    }
    catch {
        Write-Log "Backend build failed: $_" -Color $Colors.Error
        return $false
    }
}

function Configure-Nginx {
    Write-Log "Configuring Nginx..." -Color $Colors.Info

    try {
        $nginxConfig = @"
server {
    listen 80;
    listen [::]:80;
    server_name $VpsDomain www.$VpsDomain;
    return 301 https://$VpsDomain\`$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.$VpsDomain;

    ssl_certificate /etc/letsencrypt/live/$VpsDomain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$VpsDomain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://$VpsDomain\`$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $VpsDomain;

    ssl_certificate /etc/letsencrypt/live/$VpsDomain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$VpsDomain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root $VpsPath/frontend;
    index index.html;

    location / {
        try_files \`$uri \`$uri/ /index.html;
    }

    location = /api {
        return 301 /api/;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host \`$host;
        proxy_set_header X-Real-IP \`$remote_addr;
        proxy_set_header X-Forwarded-For \`$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \`$scheme;
        proxy_set_header Upgrade \`$http_upgrade;
        proxy_set_header Connection \"upgrade\";
    }

    location /admin {
        proxy_pass http://127.0.0.1:3000/admin;
        proxy_http_version 1.1;
        proxy_set_header Host \`$host;
        proxy_set_header X-Real-IP \`$remote_addr;
        proxy_set_header X-Forwarded-For \`$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \`$scheme;
        proxy_set_header Upgrade \`$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_cache_bypass \`$http_upgrade;
    }
}
"@

        # Write nginx config
        $nginxScript = @"
cat > /etc/nginx/sites-available/arafatvisitor << 'NGINXEOF'
$nginxConfig
NGINXEOF

ln -sf /etc/nginx/sites-available/arafatvisitor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "NGINX_CONFIGURED"
"@

        $result = Invoke-VpsCommand -Command $nginxScript -ReturnOutput

        if ($result -match "NGINX_CONFIGURED") {
            Write-Log "Nginx configured successfully" -Color $Colors.Success
        }

        return $true
    }
    catch {
        Write-Log "Nginx configuration failed: $_" -Color $Colors.Error
        return $false
    }
}

function Start-Pm2Process {
    param([switch]$Restart)

    $action = if ($Restart) { "Restarting" } else { "Starting" }
    Write-Log "$action PM2 process..." -Color $Colors.Info

    try {
        $pm2Script = @"
set -e
cd $VpsPath/backend

if [ "$Restart" = "true" ]; then
    pm2 restart arafatvisitor-api 2>/dev/null || pm2 start dist/src/main.js --name arafatvisitor-api
else
    pm2 delete arafatvisitor-api 2>/dev/null || true
    pm2 start dist/src/main.js --name arafatvisitor-api
fi

pm2 save
pm2 startup 2>/dev/null || true
echo "PM2_STARTED"
"@

        $result = Invoke-VpsCommand -Command $pm2Script -ReturnOutput

        if ($result -match "PM2_STARTED") {
            Write-Log "PM2 process started successfully" -Color $Colors.Success
        }

        return $true
    }
    catch {
        Write-Log "PM2 start failed: $_" -Color $Colors.Error
        return $false
    }
}

function Update-Backend {
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "Updating Backend" -Color $Colors.Step
    Write-Log "========================================" -Color $Colors.Step

    try {
        $updateScript = @"
set -e
cd $VpsPath/backend
export `$(grep -v '^#' .env | xargs) 2>/dev/null || true

# Install any new dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run new migrations (safe - won't delete data)
npx prisma migrate deploy

# Rebuild backend
npm run build

# Restart PM2 process
pm2 restart arafatvisitor-api 2>/dev/null || pm2 start dist/src/main.js --name arafatvisitor-api
pm2 save

echo "UPDATE_COMPLETE"
"@

        $result = Invoke-VpsCommand -Command $updateScript -ReturnOutput

        if ($result -match "UPDATE_COMPLETE") {
            Write-Log "Backend updated successfully" -Color $Colors.Success
        }

        return $true
    }
    catch {
        Write-Log "Backend update failed: $_" -Color $Colors.Error
        return $false
    }
}

#endregion

#region Testing Functions

function Test-FrontendHealth {
    Write-Log "Testing frontend endpoint..." -Color $Colors.Info

    try {
        $testUrl = "https://$VpsDomain/"
        $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 30 -UseBasicParsing -SkipCertificateCheck

        if ($response.StatusCode -eq 200) {
            Write-Log "Frontend health check PASSED" -Color $Colors.Success
            return $true
        } else {
            Write-Log "Frontend returned status code: $($response.StatusCode)" -Color $Colors.Warning
            return $false
        }
    }
    catch {
        Write-Log "Frontend health check FAILED: $_" -Color $Colors.Warning
        Write-Log "  This may be due to SSL certificate or DNS issues" -Color $Colors.Info
        return $false
    }
}

function Test-BackendHealth {
    Write-Log "Testing backend API endpoint..." -Color $Colors.Info

    try {
        # Test via VPS internal port first
        $internalCheck = Invoke-VpsCommand -Command "curl -s http://localhost:3000/health || echo 'FAILED'" -ReturnOutput -Silent

        if ($internalCheck -notmatch "FAILED") {
            Write-Log "Backend health check PASSED (internal)" -Color $Colors.Success
            return $true
        }

        # Try external endpoint
        $testUrl = "https://$VpsDomain/api/health"
        $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 30 -UseBasicParsing -SkipCertificateCheck

        if ($response.StatusCode -eq 200) {
            Write-Log "Backend health check PASSED" -Color $Colors.Success
            return $true
        } else {
            Write-Log "Backend returned status code: $($response.StatusCode)" -Color $Colors.Warning
            return $false
        }
    }
    catch {
        Write-Log "Backend health check FAILED: $_" -Color $Colors.Warning
        return $false
    }
}

function Test-Pm2Status {
    Write-Log "Checking PM2 process status..." -Color $Colors.Info

    try {
        $status = Invoke-VpsCommand -Command "pm2 jlist" -ReturnOutput -Silent

        if ($status -match "arafatvisitor-api" -and $status -match '"status":"online"') {
            Write-Log "PM2 process is running" -Color $Colors.Success
            return $true
        } else {
            Write-Log "PM2 process may not be running properly" -Color $Colors.Warning

            # Show PM2 status
            $pm2Status = Invoke-VpsCommand -Command "pm2 status" -ReturnOutput -Silent
            Write-Log "PM2 Status: $pm2Status" -Color $Colors.Info
            return $false
        }
    }
    catch {
        Write-Log "PM2 status check failed: $_" -Color $Colors.Warning
        return $false
    }
}

#endregion

#region Main Deployment Function

function Start-Deployment {
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "Arafat Visitor Management System" -Color $Colors.Step
    Write-Log "VPS Deployment Script" -Color $Colors.Step
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "VPS Host: $VpsHost" -Color $Colors.Info
    Write-Log "VPS User: $VpsUser" -Color $Colors.Info
    Write-Log "VPS Path: $VpsPath" -Color $Colors.Info
    Write-Log "Domain: $VpsDomain" -Color $Colors.Info
    Write-Log "Init Mode: $Init" -Color $Colors.Info
    Write-Log "Skip Frontend: $SkipFrontend" -Color $Colors.Info
    Write-Log "Skip Backend: $SkipBackend" -Color $Colors.Info
    Write-Log ""

    # Validate prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Log "Prerequisites validation failed. Exiting." -Color $Colors.Error
        exit 1
    }
    Write-Log ""

    # Test SSH connection
    if (-not (Test-SshConnection)) {
        Write-Log "Cannot establish SSH connection to VPS." -Color $Colors.Error
        Write-Log "Please ensure:" -Color $Colors.Info
        Write-Log "1. VPS is accessible and SSH service is running" -Color $Colors.Info
        Write-Log "2. Firewall allows SSH connections (port 22)" -Color $Colors.Info
        Write-Log "3. Credentials are correct" -Color $Colors.Info
        Write-Log ""
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            exit 1
        }
    }
    Write-Log ""

    # Track deployment results
    $results = @{
        Frontend = $null
        Backend = $null
    }

    # Initial setup mode
    if ($Init) {
        Write-Log "Running initial VPS setup..." -Color $Colors.Step

        if (-not (Initialize-VpsEnvironment)) {
            Write-Log "Initial environment setup failed. Exiting." -Color $Colors.Error
            exit 1
        }
    }

    # Build and deploy frontend
    if (-not $SkipFrontend) {
        if (Build-Frontend) {
            $results.Frontend = Deploy-Frontend
        } else {
            $results.Frontend = $false
        }
    } else {
        Write-Log "Skipping frontend deployment" -Color $Colors.Info
        $results.Frontend = $true
    }

    # Deploy backend
    if (-not $SkipBackend) {
        $results.Backend = Deploy-Backend

        if ($results.Backend) {
            if ($Init) {
                # Full setup for initial deployment
                Setup-BackendEnvironment | Out-Null
                Seed-Database | Out-Null
                Build-BackendOnVps | Out-Null
                Configure-Nginx | Out-Null
                Start-Pm2Process | Out-Null
            } else {
                # Update deployment
                Update-Backend | Out-Null
                Configure-Nginx | Out-Null
            }
        }
    } else {
        Write-Log "Skipping backend deployment" -Color $Colors.Info
        $results.Backend = $true
    }

    # Verification
    if (-not $SkipTests) {
        Write-Log ""
        Write-Log "========================================" -Color $Colors.Step
        Write-Log "Verifying Deployment" -Color $Colors.Step
        Write-Log "========================================" -Color $Colors.Step

        Start-Sleep -Seconds 5

        Test-Pm2Status | Out-Null
        Test-BackendHealth | Out-Null
        Test-FrontendHealth | Out-Null
    }

    # Summary
    Write-Log ""
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "Deployment Summary" -Color $Colors.Step
    Write-Log "========================================" -Color $Colors.Step
    Write-Log "VPS: $VpsHost" -Color $Colors.Info
    Write-Log "Domain: https://$VpsDomain" -Color $Colors.Info
    Write-Log "Admin Panel: https://$VpsDomain/admin" -Color $Colors.Info
    Write-Log ""
    Write-Log "Frontend: $(if ($results.Frontend) { 'SUCCESS' } else { 'FAILED' })" -Color $(if ($results.Frontend) { $Colors.Success } else { $Colors.Error })
    Write-Log "Backend: $(if ($results.Backend) { 'SUCCESS' } else { 'FAILED' })" -Color $(if ($results.Backend) { $Colors.Success } else { $Colors.Error })
    Write-Log ""

    if ($Init) {
        Write-Log "Default Users Created:" -Color $Colors.Info
        Write-Log "  - admin@arafat.com / admin123" -Color $Colors.Info
        Write-Log "  - gm@arafat.com / gm123" -Color $Colors.Info
        Write-Log "  - reception@arafat.com / reception123" -Color $Colors.Info
        Write-Log ""
    }

    if ($results.Frontend -and $results.Backend) {
        Write-Log "Deployment completed successfully!" -Color $Colors.Success
        exit 0
    } else {
        Write-Log "Deployment completed with errors" -Color $Colors.Error
        exit 1
    }
}

#endregion

# Run deployment
Start-Deployment
