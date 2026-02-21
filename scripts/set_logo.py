#!/usr/bin/env python3
"""Copy a local logo asset into docs/assets/se-logo.png for login branding."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/set_logo.py <path-to-logo-png>")
        return 1

    source = Path(sys.argv[1]).expanduser()
    target = ROOT / "docs/assets/se-logo.png"

    if not source.exists():
        print(f"Error: source file not found: {source}")
        return 2

    if source.suffix.lower() not in {".png", ".jpg", ".jpeg", ".svg"}:
        print("Error: source must be an image file (.png, .jpg, .jpeg, .svg)")
        return 3

    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    print(f"Logo copied to: {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
