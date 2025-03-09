-- PostgreSQL Setup and Permissions Script
-- This script must be run as superuser (postgres)
-- Purpose: Sets up the powr user and grants necessary permissions for the POWR application

-- Ensure we're not in a transaction
COMMIT;

-- Create powr user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'powr') THEN
    CREATE USER powr WITH PASSWORD 'powr_password';
    RAISE NOTICE 'Created powr user';
  ELSE
    RAISE NOTICE 'User powr already exists';
  END IF;
END
$$;

-- Create database if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'powr_db') THEN
    CREATE DATABASE powr_db;
    RAISE NOTICE 'Created powr_db database';
  ELSE
    RAISE NOTICE 'Database powr_db already exists';
  END IF;
END
$$;

-- Grant database ownership
ALTER DATABASE powr_db OWNER TO powr;

-- Connect to powr_db
\c powr_db

-- Ensure we're using the public schema
SET search_path TO public;

-- Grant schema ownership
ALTER SCHEMA public OWNER TO powr;

-- Revoke all privileges from public schema to ensure clean slate
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Grant specific privileges to powr user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO powr;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO powr;
GRANT ALL PRIVILEGES ON SCHEMA public TO powr;

-- Set default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO powr;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO powr;

-- Verify setup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_user WHERE usename = 'powr'
    AND (
      SELECT has_database_privilege('powr', 'powr_db', 'CONNECT')
      AND has_schema_privilege('powr', 'public', 'USAGE')
    )
  ) THEN
    RAISE EXCEPTION 'Setup verification failed. Please check permissions manually.';
  END IF;
  RAISE NOTICE 'Setup completed successfully';
END
$$; 