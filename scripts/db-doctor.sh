#!/usr/bin/env bash
set -euo pipefail

echo "=== Database diagnostics ==="
echo

echo "1. Port 5432 listeners:"
ss -tlnp 2>/dev/null | grep ':5432' || echo "   (none)"
echo

echo "2. System PostgreSQL service:"
systemctl is-active postgresql 2>/dev/null || echo "   inactive or not installed"
echo

echo "3. Docker containers (postgres/redis):"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker ps -a --filter name=ecommerce-amazon --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || true
  if docker ps -q --filter name=ecommerce-amazon-postgres-1 | grep -q .; then
    echo
    echo "   Postgres port mapping:"
    docker port ecommerce-amazon-postgres-1 2>/dev/null || echo "   (empty — container NOT exposed on host; likely system Postgres holds 5432)"
  fi
else
  echo "   docker not available or permission denied"
fi
echo

echo "4. Auth test (vitrine@vitrine from .env):"
if PGPASSWORD=vitrine psql -h 127.0.0.1 -p 5432 -U vitrine -d vitrine -c 'SELECT 1' >/dev/null 2>&1; then
  echo "   OK — credentials work on localhost:5432"
else
  echo "   FAILED — wrong server or user not created"
  echo
  echo "   Common cause: Docker postgres is running but port 5432 is taken by system PostgreSQL."
  echo "   Fix:"
  echo "     sudo systemctl stop postgresql"
  echo "     docker compose down && docker compose up -d"
  echo "     npm run db:setup"
fi
