-- Creates the default dev user/database expected by .env.example
-- Run as a PostgreSQL superuser, e.g.:
--   psql -U postgres -f scripts/init-local-postgres.sql

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vitrine') THEN
    CREATE ROLE vitrine WITH LOGIN PASSWORD 'vitrine';
  ELSE
    ALTER ROLE vitrine WITH LOGIN PASSWORD 'vitrine';
  END IF;
END
$$;

SELECT 'CREATE DATABASE vitrine OWNER vitrine'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vitrine')\gexec

GRANT ALL PRIVILEGES ON DATABASE vitrine TO vitrine;
