# Create PostgreSQL database vms_db for VMS Backend
# Usage: .\scripts\create-db.ps1
# Laragon: try -User root or -User YourWindowsLogin (e.g. -User Arafat)

param(
    [string]$PgBin = "",
    [string]$PgHost = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Database = "vms_db"
)

$ErrorActionPreference = "Stop"

# Find psql.exe
if (-not $PgBin) {
    $paths = @(
        "C:\laragon\bin\postgresql\postgresql\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\13\bin\psql.exe"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) { $PgBin = $p; break }
    }
    if (-not $PgBin) {
        $cmd = Get-Command psql -ErrorAction SilentlyContinue
        if ($cmd) { $PgBin = $cmd.Source }
    }
}

if (-not $PgBin -or -not (Test-Path $PgBin)) {
    Write-Host "psql not found. Set -PgBin to your PostgreSQL bin path, e.g.:"
    Write-Host "  .\scripts\create-db.ps1 -PgBin 'C:\Program Files\PostgreSQL\16\bin\psql.exe'"
    exit 1
}

Write-Host "Using: $PgBin"
Write-Host "Creating database '$Database'..."

# Try without password first (trust auth)
$env:PGPASSWORD = $null
$err = & $PgBin -U $User -h $PgHost -p $Port -d postgres -c "CREATE DATABASE $Database;" 2>&1
$ok = $LASTEXITCODE

if ($ok -ne 0) {
    if ($err -match "role .* does not exist") {
        $alt = if ($User -eq "root") { $env:USERNAME } else { "root" }
        Write-Host "Hint: Role '$User' not found. Try: .\scripts\create-db.ps1 -User $alt"
    }
    $pwd = Read-Host "Password for user '$User' (or press Enter to skip)"
    if ($pwd) { $env:PGPASSWORD = $pwd }
    & $PgBin -U $User -h $PgHost -p $Port -d postgres -c "CREATE DATABASE $Database;" 2>&1 | Out-Null
    $ok = $LASTEXITCODE
    $env:PGPASSWORD = $null
}

if ($ok -eq 0) {
    Write-Host "Database '$Database' created. Run: npx prisma migrate deploy"
} else {
    Write-Host "Note: If the database already exists, run 'npx prisma migrate deploy' anyway."
}
exit $ok
