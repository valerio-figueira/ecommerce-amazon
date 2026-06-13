#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL="$ROOT/scripts/init-local-postgres.sql"

echo "Creating role/database vitrine on the local PostgreSQL (port 5432)..."
echo "Requires sudo once (postgres superuser)."
echo

sudo -u postgres psql -f "$SQL"

echo
echo "Done. Run: npm run db:setup"
