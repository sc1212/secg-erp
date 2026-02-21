# LOGIN + BRANDING GUIDE

## Goal
Deliver a polished, trustworthy sign-in experience with SECG branding for owners, finance teams, PMs, and field users.

## Login experience spec
- Left panel: brand story + trust message + product value points.
- Right panel: clean sign-in card with:
  - Username/email
  - Password
  - Remember me
  - Forgot password
  - Sign in CTA
- Footer links: Terms, Privacy, Support.

## Visual design defaults
- Logo: SECG lockup in top-left and card header.
- Color palette: deep slate + construction gold accent.
- Typography: clean sans-serif with strong hierarchy.
- Shadows and rounded corners kept subtle and executive-grade.

## Security/UX details
- Password field has show/hide toggle.
- Failed login message is clear but does not leak account existence.
- Loading state on submit button.
- Session timeout redirects back to login with contextual message.

## API wiring
- `POST /api/auth/login` with `username_or_email` + `password`.
- Store returned bearer token securely (for current baseline client flow).
- `GET /api/auth/me` on app bootstrap to hydrate user context.


## Locked brand direction
- Tone: Premium executive.
- Logo source: stakeholder PNG (place in `docs/assets/se-logo.png`).


## Logo-first layout update
- The login page is now explicitly designed around the logo hero on the left panel.
- If `docs/assets/se-logo.png` exists, it is the primary rendered logo asset.
- If not present locally, fallback renders `docs/assets/se-logo-mark.svg` to preserve branded composition.


## Logo import helper
- Use `python scripts/set_logo.py "<path-to-logo>"` to copy your logo into `docs/assets/se-logo.png`.
- This enables the login page to render your real brand mark immediately.

- PowerShell fallback (no Python required): `.\scripts\set_logo.ps1` or provide `-SourcePath`.
