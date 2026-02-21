#!/usr/bin/env python3
"""Preflight checker for first local run.

Checks:
- critical env vars presence
- logo asset presence
- key route registration
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.main import app

REQUIRED_ENV = ["DATABASE_URL", "SECRET_KEY"]
OPTIONAL_ENV = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
REQUIRED_ROUTES = [
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/me",
    "/api/billing/status",
    "/api/dashboard",
]


def main() -> int:
    ok = True

    print("== SECG ERP First-Run Preflight ==")

    print("\n[ENV]")
    for key in REQUIRED_ENV:
        present = bool(os.getenv(key))
        print(f"- {key}: {'OK' if present else 'MISSING'}")
        ok = ok and present

    for key in OPTIONAL_ENV:
        present = bool(os.getenv(key))
        print(f"- {key}: {'SET' if present else 'NOT_SET (optional for non-billing run)'}")

    print("\n[ASSETS]")
    logo = ROOT / "docs/assets/se-logo.png"
    fallback = ROOT / "docs/assets/se-logo-mark.svg"
    print(f"- logo png: {'OK' if logo.exists() else 'MISSING'} ({logo})")
    print(f"- logo fallback: {'OK' if fallback.exists() else 'MISSING'} ({fallback})")

    print("\n[ROUTES]")
    route_paths = {r.path for r in app.routes}
    for route in REQUIRED_ROUTES:
        present = route in route_paths
        print(f"- {route}: {'OK' if present else 'MISSING'}")
        ok = ok and present

    print("\nResult:", "READY" if ok else "NOT READY")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
