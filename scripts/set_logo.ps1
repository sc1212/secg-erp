param(
  [Parameter(Mandatory = $false)][string]$SourcePath,
  [Parameter(Mandatory = $false)][string]$RepoPath
)

$ErrorActionPreference = "Stop"

function Resolve-DefaultSource {
  $candidates = @(
    "$env:USERPROFILE\OneDrive\Documents\Assets\se-logo.png",
    "$env:USERPROFILE\OneDrive\Documents\Assets\se-logo.png.png",
    "$env:USERPROFILE\OneDrive\Documents\Assets\SE-logo.png",
    "$env:USERPROFILE\OneDrive\Documents\Assets\logo.png",
    "$env:USERPROFILE\OneDrive\Documents\Assets\se-logo.jpg",
    "$env:USERPROFILE\OneDrive\Documents\Assets\se-logo.jpeg"
  )

  foreach ($c in $candidates) {
    if (Test-Path $c) { return $c }
  }
  return $null
}

function Resolve-RepoPath {
  param([string]$InputRepoPath)

  if ($InputRepoPath -and $InputRepoPath.Trim() -ne "") {
    return (Resolve-Path $InputRepoPath).Path
  }

  $candidate = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  return $candidate
}

$RepoPath = Resolve-RepoPath $RepoPath

if (-not (Test-Path (Join-Path $RepoPath "docs\assets"))) {
  Write-Host "Repo path does not look valid: $RepoPath" -ForegroundColor Red
  Write-Host "Expected folder missing: docs\\assets" -ForegroundColor Yellow
  Write-Host "Tip: run from your repo root OR pass -RepoPath explicitly." -ForegroundColor Yellow
  exit 5
}

if (-not $SourcePath -or $SourcePath.Trim() -eq "") {
  $SourcePath = Resolve-DefaultSource
}

if (-not $SourcePath) {
  Write-Host "Could not auto-find logo in OneDrive Assets." -ForegroundColor Red
  Write-Host "Run with explicit path, e.g.:" -ForegroundColor Yellow
  Write-Host '.\scripts\set_logo.ps1 -SourcePath "C:\Users\<you>\OneDrive\Documents\Assets\<logo-file>.png"' -ForegroundColor Cyan
  exit 2
}

if (-not (Test-Path $SourcePath)) {
  Write-Host "Source file not found: $SourcePath" -ForegroundColor Red
  Write-Host "Tip: list your Assets folder to find real file name:" -ForegroundColor Yellow
  Write-Host 'Get-ChildItem "$env:USERPROFILE\OneDrive\Documents\Assets" -File' -ForegroundColor Cyan
  exit 3
}

$ext = [System.IO.Path]::GetExtension($SourcePath).ToLowerInvariant()
if ($ext -notin @('.png', '.jpg', '.jpeg', '.svg')) {
  Write-Host "Unsupported extension: $ext" -ForegroundColor Red
  exit 4
}

$target = Join-Path $RepoPath "docs\assets\se-logo.png"
$targetDir = Split-Path $target -Parent
if (-not (Test-Path $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir | Out-Null
}

Copy-Item -Path $SourcePath -Destination $target -Force
Write-Host "Logo copied to $target" -ForegroundColor Green
