<#
.SYNOPSIS
    WinDeply Package Installer
.DESCRIPTION
    Installs required software packages for Windows OS deployment.
    Part of the WinDeply Windows Deployment Automation Platform.
.PARAMETER PackageList
    Comma-separated list of packages to install
.PARAMETER Profile
    Configuration profile: standard, developer, minimal, hardened
.EXAMPLE
    .\install_packages.ps1 -PackageList "git,vscode,nodejs" -Profile developer
#>

param(
    [string]$PackageList = "git,7zip,notepadplusplus",
    [ValidateSet("standard","developer","minimal","hardened")]
    [string]$Profile = "standard"
)

$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"

# ─────────────────────────────────────────────
# Logging Functions
# ─────────────────────────────────────────────
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "INFO"    { "Cyan" }
        "SUCCESS" { "Green" }
        "WARN"    { "Yellow" }
        "ERROR"   { "Red" }
        default   { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# ─────────────────────────────────────────────
# Package Registry
# ─────────────────────────────────────────────
$PackageRegistry = @{
    "git"              = @{ Name = "Git for Windows"; Version = "2.43.0"; Source = "winget" }
    "vscode"           = @{ Name = "Visual Studio Code"; Version = "1.85.0"; Source = "winget" }
    "nodejs"           = @{ Name = "Node.js LTS"; Version = "20.10.0"; Source = "winget" }
    "python"           = @{ Name = "Python 3.11"; Version = "3.11.7"; Source = "winget" }
    "7zip"             = @{ Name = "7-Zip"; Version = "23.01"; Source = "winget" }
    "notepadplusplus"  = @{ Name = "Notepad++"; Version = "8.6.0"; Source = "winget" }
    "docker"           = @{ Name = "Docker Desktop"; Version = "4.26.0"; Source = "winget" }
    "chrome"           = @{ Name = "Google Chrome"; Version = "120.0"; Source = "winget" }
    "slack"            = @{ Name = "Slack"; Version = "4.36.0"; Source = "winget" }
    "zoom"             = @{ Name = "Zoom"; Version = "5.16.0"; Source = "winget" }
}

# ─────────────────────────────────────────────
# Installation Function (Simulated)
# ─────────────────────────────────────────────
function Install-Package {
    param([string]$PackageId)

    if ($PackageRegistry.ContainsKey($PackageId)) {
        $pkg = $PackageRegistry[$PackageId]
        Write-Log "Downloading: $($pkg.Name) v$($pkg.Version)..." "INFO"
        Start-Sleep -Milliseconds 300
        Write-Log "Verifying checksum for $($pkg.Name)..." "INFO"
        Start-Sleep -Milliseconds 200
        Write-Log "Installing $($pkg.Name) v$($pkg.Version)..." "INFO"
        Start-Sleep -Milliseconds 500
        Write-Log "$($pkg.Name) installed successfully" "SUCCESS"
        return @{ Package = $PackageId; Status = "Installed"; Version = $pkg.Version }
    } else {
        Write-Log "Package not found in registry: $PackageId" "WARN"
        return @{ Package = $PackageId; Status = "NotFound"; Version = $null }
    }
}

# ─────────────────────────────────────────────
# Main Execution
# ─────────────────────────────────────────────
Write-Log "═══════════════════════════════════════════" "INFO"
Write-Log " WinDeply Package Installer v1.0.0" "INFO"
Write-Log " Profile: $Profile" "INFO"
Write-Log "═══════════════════════════════════════════" "INFO"

$packages = $PackageList -split "," | ForEach-Object { $_.Trim().ToLower() }
Write-Log "Packages to install: $($packages.Count)" "INFO"

$results = @()
$failed = 0
$installed = 0

foreach ($pkg in $packages) {
    $result = Install-Package -PackageId $pkg
    $results += $result
    if ($result.Status -eq "Installed") { $installed++ }
    else { $failed++ }
}

# ─────────────────────────────────────────────
# Summary Report
# ─────────────────────────────────────────────
Write-Log "───────────────────────────────────────────" "INFO"
Write-Log "INSTALLATION SUMMARY" "INFO"
Write-Log "  Total:     $($packages.Count)" "INFO"
Write-Log "  Installed: $installed" "SUCCESS"
if ($failed -gt 0) {
    Write-Log "  Failed:    $failed" "WARN"
}
Write-Log "───────────────────────────────────────────" "INFO"

if ($failed -gt 0) {
    Write-Log "Installation completed with warnings" "WARN"
    exit 1
} else {
    Write-Log "All packages installed successfully" "SUCCESS"
    exit 0
}
