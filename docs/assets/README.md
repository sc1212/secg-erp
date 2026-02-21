# Brand Assets

Place approved brand assets here for local visual mocks and future frontend build:

- `se-logo.png` (provided by stakeholder)
- optional: `se-logo-dark.png`
- optional: `se-logo-mark.svg`

`docs/login_mockup.html` will automatically render `se-logo.png` when present.

## Windows setup (works from `PS C:\Users\Samue>`)

### 1) Find your real repo folder (do **not** use placeholder paths)
Run this first:

```powershell
Get-ChildItem "$env:USERPROFILE" -Directory -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -eq "secg-erp" } |
  Select-Object -First 5 -ExpandProperty FullName
```

Copy one returned path, for example:
`C:\Users\Samue\OneDrive\Documents\GitHub\secg-erp`

### 2) Set the logo using full paths (works from any folder)

```powershell
python "C:\Users\Samue\OneDrive\Documents\GitHub\secg-erp\scripts\set_logo.py" "C:\Users\Samue\OneDrive\Documents\Assets\se-logo.png.png"
```

Or with PowerShell helper:

```powershell
& "C:\Users\Samue\OneDrive\Documents\GitHub\secg-erp\scripts\set_logo.ps1" -SourcePath "C:\Users\Samue\OneDrive\Documents\Assets\se-logo.png.png"
```

### 3) Run preflight using full path

```powershell
python "C:\Users\Samue\OneDrive\Documents\GitHub\secg-erp\scripts\first_run_check.py"
```

## One command from any PowerShell folder
If you only want “do it for me now”, run:

```powershell
& "C:\Users\Samue\OneDrive\Documents\GitHub\secg-erp\scripts\windows_run_now.ps1" -SourcePath "C:\Users\Samue\OneDrive\Documents\Assets\se-logo.png.png"
```

This will:
1) locate/use the repo,
2) copy logo to `docs/assets/se-logo.png`,
3) run preflight check.

## If the full path command fails (most common case)
Use this copy/paste block from **any** PowerShell window. It does **not** require `windows_run_now.ps1`:

```powershell
$repo = Get-ChildItem "$env:USERPROFILE" -Directory -Recurse -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Name -eq "secg-erp" -and
    (Test-Path (Join-Path $_.FullName "scripts\set_logo.py")) -and
    (Test-Path (Join-Path $_.FullName "scripts\first_run_check.py"))
  } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $repo) {
  Write-Host "Could not find a usable secg-erp repo under your user profile." -ForegroundColor Red
  Write-Host "Run 'git pull' in your repo, then retry." -ForegroundColor Yellow
  return
}

$setLogo = Join-Path $repo "scripts\set_logo.py"
$preflight = Join-Path $repo "scripts\first_run_check.py"

python $setLogo "C:\Users\Samue\OneDrive\Documents\Assets\se-logo.png.png"
python $preflight
```

This avoids hardcoding repo paths like `...\GitHub\secg-erp` and also works if your local clone has not yet pulled the `windows_run_now.ps1` helper.

## Troubleshooting
- `...set_logo.ps1 is not recognized`: you used a relative path from the wrong folder. Use the full script path as shown above.
- `python ... can't open file C:\Users\Samue\scripts\...`: same issue; use full path to the script in your repo.
- Your file currently appears to be named `se-logo.png.png` (double extension). Either keep that exact filename in the command or rename it.
