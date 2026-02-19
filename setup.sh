#!/bin/bash
# SECG ERP — Quick Setup
# Usage: bash setup.sh
#
# This script:
#   1. Starts PostgreSQL via Docker (or uses DATABASE_URL if set)
#   2. Installs Python dependencies
#   3. Creates all database tables
#   4. Starts the API server
#
# After it's running, open http://localhost:8000/api/docs
# Go to the Admin section → POST /api/admin/import/masterfile → upload your file

set -e

echo "══════════════════════════════════════════════════════"
echo "  SECG ERP — Setup"
echo "══════════════════════════════════════════════════════"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Install it first."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Install dependencies
echo ""
echo "Installing Python packages..."
pip install -r requirements.txt -q

# Start database if Docker is available and no DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    if command -v docker &> /dev/null; then
        echo ""
        echo "Starting PostgreSQL via Docker..."
        docker compose up -d db 2>/dev/null || docker-compose up -d db 2>/dev/null || true
        sleep 3
        echo "✓ PostgreSQL running on localhost:5432"
    else
        echo ""
        echo "⚠ No Docker and no DATABASE_URL set."
        echo "  Either install Docker, or set DATABASE_URL:"
        echo "  export DATABASE_URL=postgresql://user:pass@host:5432/secg_erp"
        exit 1
    fi
else
    echo "✓ Using DATABASE_URL from environment"
fi

# Create tables
echo ""
echo "Creating database tables..."
python3 -c "
from backend.core.database import Base, engine
Base.metadata.create_all(bind=engine)
from sqlalchemy import inspect
tables = inspect(engine).get_table_names()
print(f'✓ {len(tables)} tables ready')
"

# Start server
echo ""
echo "══════════════════════════════════════════════════════"
echo "  Starting API server..."
echo "  Swagger UI: http://localhost:8000/api/docs"
echo ""
echo "  NEXT STEPS:"
echo "  1. Open http://localhost:8000/api/docs"
echo "  2. Expand 'Admin & Import' section"
echo "  3. POST /api/admin/import/masterfile"
echo "     → Upload SECG_Ultimate_Masterfile.xlsx"
echo "  4. Then upload budget CSVs, leads, proposals, jobs"
echo "  5. GET /api/admin/status to verify"
echo "  6. GET /api/dashboard for the full command center"
echo "══════════════════════════════════════════════════════"
echo ""

uvicorn backend.main:app --reload --port 8000
