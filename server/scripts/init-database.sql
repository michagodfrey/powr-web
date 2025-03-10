-- PostgreSQL Database Initialization Script
-- This script should be run as the powr user AFTER running setup-permissions.sql as postgres superuser
-- Purpose: Sets up the database schema for the POWR application

-- Verify we're running as powr user
DO $$
BEGIN
    IF NOT (SELECT current_user = 'powr') THEN
        RAISE EXCEPTION 'This script must be run as the powr user. Please run setup-permissions.sql first as postgres superuser.';
    END IF;
END
$$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS sets CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture VARCHAR(512),
    preferred_unit VARCHAR(2) NOT NULL DEFAULT 'kg',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_preferred_unit CHECK (preferred_unit IN ('kg', 'lb'))
);

-- Create exercises table
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT exercises_user_id_name_unique UNIQUE (user_id, name)
);

-- Create workout_sessions table
CREATE TABLE workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    total_volume DECIMAL(10,2) NOT NULL,
    unit VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit CHECK (unit IN ('kg', 'lb'))
);

-- Create sets table
CREATE TABLE sets (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight DECIMAL(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    unit VARCHAR(2) NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit CHECK (unit IN ('kg', 'lb')),
    CONSTRAINT chk_weight_positive CHECK (weight > 0),
    CONSTRAINT chk_reps_positive CHECK (reps > 0)
);

-- Create sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_exercises_user ON exercises(user_id);
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_exercise ON workout_sessions(exercise_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(date DESC);
CREATE INDEX idx_sets_session ON sets(session_id);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
    BEFORE UPDATE ON workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sets_updated_at
    BEFORE UPDATE ON sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 