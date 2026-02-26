# ================================================================
# Setup-ClaudeGLM.ps1
#
# Sets up dual Claude Code profiles:
#   claude       -> Claude.ai login (Opus) - all phases except implement
#   s-claude    -> GLM via Z.ai API key   - speckit implement only
#   init-claude -> NEW project: creates CLAUDE.md + read/ directory
#   adopt-claude -> EXISTING project: adds read/ without touching CLAUDE.md
#
# Usage:
#   .\Setup-ClaudeGLM.ps1
#   .\Setup-ClaudeGLM.ps1 -ZaiApiKey "your-key-here"
# ================================================================

param(
    [string]$ZaiApiKey = ""
)

function Write-Header  { param($msg) Write-Host "`n-- $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info    { param($msg) Write-Host "  [..] $msg" -ForegroundColor Yellow }
function Write-Err     { param($msg) Write-Host "  [!!] $msg" -ForegroundColor Red }

Write-Host @'
  Claude Code + GLM Dual Profile Setup
  claude -> Opus  |  s-claude -> GLM  |  init-claude / adopt-claude
'@ -ForegroundColor Cyan


# -- Step 1: Collect Z.ai API Key ────────────────────────────
Write-Header "Step 1: Z.ai API Key"
Write-Info "claude uses your Claude.ai browser login - no API key needed for Opus."

if (-not $ZaiApiKey) {
    $ZaiApiKey = Read-Host "Enter your Z.ai API key"
}
if (-not $ZaiApiKey) {
    Write-Err "Z.ai API key is required. Exiting."
    exit 1
}


# -- Step 2: Resolve Claude CLI binary path ──────────────────
Write-Header "Step 2: Locating Claude CLI"

$claudeBin = (Get-Command claude -CommandType Application -ErrorAction SilentlyContinue |
              Select-Object -First 1).Source

if ($claudeBin) {
    Write-Success "Found: $claudeBin"
} else {
    Write-Err "Claude CLI not found. Install it first:"
    Write-Info "npm install -g @anthropic-ai/claude-code"
    Write-Info "Then re-run this script."
    exit 1
}


# -- Step 3: Create Profile Directories ──────────────────────
Write-Header "Step 3: Creating Profile Directories"

$primaryDir = "$HOME\.claude"
$glmDir     = "$HOME\.claude-glm"

New-Item -ItemType Directory -Force -Path $primaryDir | Out-Null
New-Item -ItemType Directory -Force -Path $glmDir     | Out-Null

Write-Success "Opus profile : $primaryDir"
Write-Success "GLM profile  : $glmDir"


# -- Step 4: Primary Profile - Claude.ai Login (Opus) ────────
Write-Header "Step 4: Opus Profile (Claude.ai login)"

@{ env = @{} } | ConvertTo-Json -Depth 5 |
    Out-File -FilePath "$primaryDir\settings.json" -Encoding UTF8

Write-Success "Written: $primaryDir\settings.json"
Write-Info "Uses Claude.ai browser auth — no API key stored."


# -- Step 5: GLM Profile - Z.ai ──────────────────────────────
Write-Header "Step 5: GLM Profile - Z.ai"

# Update ANTHROPIC_DEFAULT_*_MODEL values when Z.ai publishes glm-5 model string
@{
    env = @{
        ANTHROPIC_AUTH_TOKEN           = $ZaiApiKey
        ANTHROPIC_BASE_URL             = "https://api.z.ai/api/anthropic"
        ANTHROPIC_DEFAULT_HAIKU_MODEL  = "glm-4.7"
        ANTHROPIC_DEFAULT_SONNET_MODEL = "glm-4.7"
        ANTHROPIC_DEFAULT_OPUS_MODEL   = "glm-4.7"
    }
} | ConvertTo-Json -Depth 5 |
    Out-File -FilePath "$glmDir\settings.json" -Encoding UTF8

Write-Success "Written: $glmDir\settings.json"
Write-Info "Update model strings to glm-5 in the file above once Z.ai confirms the name."


# -- Step 6: Save global CLAUDE.md template to user home ─────
Write-Header "Step 6: Saving global AI memory templates to ~\.claude-templates"

$templatesDir = "$HOME\.claude-templates"
$rulesDir     = "$templatesDir\rules"
New-Item -ItemType Directory -Force -Path $rulesDir | Out-Null

# Load templates from embedded files (same dir as script)
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$templatesSrc = Join-Path $scriptDir "Setup-ClaudeGLM-templates"
if (Test-Path $templatesSrc) {
    Copy-Item (Join-Path $templatesSrc "*") -Destination $templatesDir -Recurse -Force
    Copy-Item (Join-Path $templatesSrc "rules\*") -Destination $rulesDir -Force -ErrorAction SilentlyContinue
    Write-Success "Templates copied from $templatesSrc"
} else {
    # Fallback: create minimal templates inline (no here-strings to avoid parse issues)
    $claudeMd = "# CLAUDE.md - Fill per project. Run init-claude for full template."
    $claudeMd | Out-File "$templatesDir\CLAUDE.md" -Encoding UTF8
    "read/project-context.md" | Out-File "$templatesDir\project-context.md" -Encoding UTF8
    $rulesContent = "# workflow`n# speckit`n# code-quality`n# verification`n# lessons"
    $rulesContent | Out-File "$rulesDir\workflow.md" -Encoding UTF8
    $rulesContent | Out-File "$rulesDir\speckit.md" -Encoding UTF8
    $rulesContent | Out-File "$rulesDir\code-quality.md" -Encoding UTF8
    $rulesContent | Out-File "$rulesDir\verification.md" -Encoding UTF8
    $rulesContent | Out-File "$rulesDir\lessons.md" -Encoding UTF8
    Write-Info "Minimal templates created. For full templates, add Setup-ClaudeGLM-templates folder."
}
Write-Success "Templates ready at: $templatesDir"


# ── Step 7 (placeholder removed template blocks that caused parse errors)
# To restore full templates: add Setup-ClaudeGLM-templates/ folder with CLAUDE.md, workflow.md, etc.
# (removed workflow.md here-string)
# rules/speckit.md - removed
# (removed speckit.md here-string)

# rules/code-quality.md - removed
# (removed code-quality.md here-string)

# rules/verification.md - removed
# (removed verification.md here-string)

# rules/lessons.md - removed
# (removed lessons.md here-string)


# -- Step 7: Inject Functions into PowerShell Profile ────────
Write-Header "Step 7: PowerShell Profile Functions"

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$functionsPath = Join-Path $scriptDir "Setup-ClaudeGLM-profile-functions.txt"
if (-not (Test-Path $functionsPath)) {
    Write-Err "Profile functions file not found: $functionsPath"
    Write-Info "Ensure Setup-ClaudeGLM-profile-functions.txt is in the same directory as this script."
    exit 1
}
$functionsBlock = Get-Content $functionsPath -Raw -Encoding UTF8
$functionsBlock = $functionsBlock.Replace('CLAUDE_BIN_PLACEHOLDER', $claudeBin)

# Resolve profile path
$profilePath = if ($PROFILE) { $PROFILE } else {
    "$HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
}

$profileParent = Split-Path $profilePath -Parent
if (-not (Test-Path $profileParent)) {
    New-Item -ItemType Directory -Force -Path $profileParent | Out-Null
}
if (-not (Test-Path $profilePath)) {
    New-Item -ItemType File -Force -Path $profilePath | Out-Null
    Write-Info "Created new profile file: $profilePath"
}

$existing = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
$marker = 'Claude Dual Profile'
if ($existing -and $existing.Contains($marker)) {
    Write-Info "Functions already present in profile - skipping injection."
} else {
    Add-Content -Path $profilePath -Value $functionsBlock
    Write-Success "Functions injected into: $profilePath"
}


# -- Done
$doneMsg = @'
  Setup Complete!
  Reload your profile: . $PROFILE
  For NEW projects: init-claude | For EXISTING: adopt-claude
  claude = Opus | s-claude = GLM
'@
Write-Host $doneMsg -ForegroundColor Green
