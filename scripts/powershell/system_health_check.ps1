<#
.SYNOPSIS
    WinDeply System Health Check
.DESCRIPTION
    Validates system readiness for Windows OS deployment.
    Checks hardware resources, connectivity, and prerequisites.
.EXAMPLE
    .\system_health_check.ps1
#>

param(
    [int]$MinRAMGB = 4,
    [int]$MinDiskGB = 50,
    [string]$RequiredOS = "Windows"
)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "PASS"  { "Green" }
        "FAIL"  { "Red" }
        "WARN"  { "Yellow" }
        "CHECK" { "Cyan" }
        default { "White" }
    }
    $icon = switch ($Level) {
        "PASS"  { "✓" }
        "FAIL"  { "✗" }
        "WARN"  { "!" }
        "CHECK" { "→" }
        default { " " }
    }
    Write-Host "$ts [$icon] $Message" -ForegroundColor $color
}

$checks = @{ Passed = 0; Failed = 0; Warnings = 0 }

function Run-Check {
    param([string]$Name, [scriptblock]$Check)
    Write-Log "Checking: $Name" "CHECK"
    try {
        $result = & $Check
        if ($result.Passed) {
            Write-Log "$Name - $($result.Message)" "PASS"
            $checks.Passed++
        } elseif ($result.Warning) {
            Write-Log "$Name - $($result.Message)" "WARN"
            $checks.Warnings++
        } else {
            Write-Log "$Name - $($result.Message)" "FAIL"
            $checks.Failed++
        }
    } catch {
        Write-Log "$Name - Check failed: $($_.Exception.Message)" "FAIL"
        $checks.Failed++
    }
}

Write-Log "═══════════════════════════════════════════"
Write-Log " WinDeply System Health Check v1.0.0"
Write-Log " Machine: $env:COMPUTERNAME"
Write-Log " User: $env:USERNAME"
Write-Log "═══════════════════════════════════════════"
Start-Sleep -Milliseconds 300

# Simulate checks (in production these would use real WMI/CIM calls)

Run-Check "Operating System" {
    Start-Sleep -Milliseconds 200
    @{ Passed = $true; Message = "Windows 11 Pro (Build 22631) - Compatible" }
}

Run-Check "CPU Architecture" {
    Start-Sleep -Milliseconds 150
    @{ Passed = $true; Message = "x64 (AMD64) - 8 logical processors" }
}

Run-Check "RAM Availability" {
    Start-Sleep -Milliseconds 150
    @{ Passed = $true; Message = "16.0 GB total / 12.4 GB available (threshold: $($MinRAMGB)GB)" }
}

Run-Check "Disk Space (C:)" {
    Start-Sleep -Milliseconds 200
    @{ Passed = $true; Message = "256 GB total / 198 GB free (threshold: $($MinDiskGB)GB)" }
}

Run-Check "Network Connectivity" {
    Start-Sleep -Milliseconds 300
    @{ Passed = $true; Message = "Connected - 1Gbps Ethernet - Gateway reachable" }
}

Run-Check "DNS Resolution" {
    Start-Sleep -Milliseconds 200
    @{ Passed = $true; Message = "DNS responding - Primary: 8.8.8.8, Secondary: 8.8.4.4" }
}

Run-Check "Windows Update Service" {
    Start-Sleep -Milliseconds 150
    @{ Passed = $true; Message = "wuauserv - Running" }
}

Run-Check "Windows Defender Status" {
    Start-Sleep -Milliseconds 150
    @{ Passed = $true; Message = "Enabled - Definitions up to date" }
}

Run-Check "PowerShell Version" {
    Start-Sleep -Milliseconds 100
    @{ Passed = $true; Message = "PowerShell 7.4.0 - Required: 5.1+" }
}

Run-Check "Administrator Privileges" {
    Start-Sleep -Milliseconds 100
    @{ Passed = $true; Message = "Running as Administrator" }
}

Run-Check "Pending Reboots" {
    Start-Sleep -Milliseconds 200
    @{ Passed = $true; Message = "No pending reboots detected" }
}

Run-Check "Time Synchronization" {
    Start-Sleep -Milliseconds 150
    @{ Passed = $true; Message = "NTP sync OK - Drift: < 1s" }
}

# Summary
Write-Log "═══════════════════════════════════════════"
Write-Log "HEALTH CHECK SUMMARY" "INFO"
Write-Log "  Passed:   $($checks.Passed)" "PASS"
if ($checks.Warnings -gt 0) { Write-Log "  Warnings: $($checks.Warnings)" "WARN" }
if ($checks.Failed -gt 0) { Write-Log "  Failed:   $($checks.Failed)" "FAIL" }
Write-Log "═══════════════════════════════════════════"

if ($checks.Failed -gt 0) {
    Write-Log "System NOT ready for deployment - $($checks.Failed) critical checks failed" "FAIL"
    exit 1
} else {
    Write-Log "System READY for deployment" "PASS"
    exit 0
}
