# First End-to-End Test Run Checklist

## Decisions locked (from stakeholder)
- Trial policy: **No trial**.
- Dunning policy: **Retry failed payments for 7 days**.
- Launch plans: **3 tiers** (Core / Ops / Enterprise).
- Login branding: **Premium executive** tone using Southeast Enterprise logo.

## Must-have before first full test run
1. **Environment + deps ready**
   - Install Python deps from `requirements.txt`.
   - Confirm Stripe and auth libs are available.
   - Provide `SECRET_KEY`, `STRIPE_SECRET_KEY`, `DATABASE_URL`.
2. **DB initialization**
   - Run table setup endpoint (`/api/admin/setup`) or equivalent startup migration path.
   - Seed at least 1 auth user and 1 billing org.
3. **Auth smoke path**
   - Signup → login → me flow works.
   - Negative test for wrong password returns 401.
4. **Billing smoke path**
   - Plans endpoint returns 3 tiers.
   - Checkout session creates URL.
   - Portal session resolves for existing customer.
   - Webhook updates subscription status.
5. **UI smoke path**
   - Login page renders with logo in premium layout.
   - Protected route redirects unauthenticated users.
6. **Known missing hardening (okay for first run, not for prod)**
   - Refresh token rotation not yet implemented.
   - Forgot/reset/verify auth flows pending.
   - Full RBAC middleware enforcement pending.
   - Billing dunning automation job still pending (policy locked, engine pending).

## Recommended first test-run scope
- Focus on: auth + billing + dashboard read route.
- Keep domain write operations out of first run until tenant/RBAC hardening is in place.


## Additional missing items before first run (from latest direction)
- Bank/credit-card ingestion connector baseline (read-only import at minimum).
- QuickBooks sync baseline (COA + customer/vendor + txn pull subset).
- Buildertrend bridge import for active jobs and core milestones.
- Procurement helper baseline (job-tagged material list/cart workflow), even if vendor API automation follows later.
- Vendor credential vault/policy approach (secure storage + access control) for portal-backed workflows.


## Fast preflight command
Use one command from any PowerShell folder:

```powershell
& "C:\Users\Samue\OneDrive\Documents\GitHub\secg-erp\scripts\windows_run_now.ps1" -SourcePath "C:\Users\Samue\OneDrive\Documents\Assets\se-logo.png.png"
```

Or run only preflight directly:

```powershell
python "C:\Users\Samue\OneDrive\Documents\GitHub\secg-erp\scripts\first_run_check.py"
```

If that fails because the path is wrong, auto-find the runner first:

```powershell
$repo = Get-ChildItem "$env:USERPROFILE" -Directory -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -eq "secg-erp" } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $repo) {
  Write-Host "Could not find the secg-erp repo under your user profile." -ForegroundColor Red
  return
}

$runner = Join-Path $repo "scripts\windows_run_now.ps1"
if (-not (Test-Path $runner)) {
  Write-Host "Found repo at $repo but missing $runner" -ForegroundColor Red
  return
}

& $runner -SourcePath "C:\Users\Samue\OneDrive\Documents\Assets\se-logo.png.png"
```

If you do not know your repo location yet, find it first:

```powershell
Get-ChildItem "$env:USERPROFILE" -Directory -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -eq "secg-erp" } |
  Select-Object -First 5 -ExpandProperty FullName
```

This reports env/asset/route readiness before your first test run.
