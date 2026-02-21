param(
  [Parameter(Mandatory = $false)][string]$RepoPath,
  [Parameter(Mandatory = $false)][string]$SourcePath
)

$ErrorActionPreference = "Stop"

function Resolve-RepoPath {
  param([string]$InputRepoPath)

  if ($InputRepoPath -and $InputRepoPath.Trim() -ne "") {
    return (Resolve-Path $InputRepoPath).Path
  }

  $found = Get-ChildItem "$env:USERPROFILE" -Directory -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq "secg-erp" } |
    Select-Object -First 1

  if ($found) {
    return $found.FullName
  }

  throw "Could not find secg-erp under $env:USERPROFILE. Pass -RepoPath explicitly."
}

function Resolve-Python {
  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) { return @("py", "-3") }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) { return @("python") }

  throw "Python not found. Install Python 3 and retry."
}

$RepoPath = Resolve-RepoPath $RepoPath
$setLogoScript = Join-Path $RepoPath "scripts\set_logo.ps1"
$preflightScript = Join-Path $RepoPath "scripts\first_run_check.py"

if (-not (Test-Path $setLogoScript)) {
  throw "Missing script: $setLogoScript"
}
if (-not (Test-Path $preflightScript)) {
  throw "Missing script: $preflightScript"
}

Write-Host "Using repo: $RepoPath" -ForegroundColor Cyan

if ($SourcePath -and $SourcePath.Trim() -ne "") {
  & $setLogoScript -RepoPath $RepoPath -SourcePath $SourcePath
} else {
  & $setLogoScript -RepoPath $RepoPath
}

$pythonCmd = Resolve-Python
Write-Host "Running preflight..." -ForegroundColor Cyan

if ($pythonCmd.Count -eq 2) {
  & $pythonCmd[0] $pythonCmd[1] $preflightScript
} else {
  & $pythonCmd[0] $preflightScript
}
