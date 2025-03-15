-- PostgreSQL Database Initialization Script
-- This script sets up the complete schema for the POWR application

-- Drop existing tables if they exist
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "sets" CASCADE;
DROP TABLE IF EXISTS "workout_sessions" CASCADE;
DROP TABLE IF EXISTS "exercises" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

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
    total_volume DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_workout_unit CHECK (unit IN ('kg', 'lb'))
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
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_set_unit CHECK (unit IN ('kg', 'lb')),
    CONSTRAINT chk_weight_positive CHECK (weight > 0),
    CONSTRAINT chk_reps_positive CHECK (reps > 0)
);

-- Create session table for connect-pg-simple
CREATE TABLE "session" (
    sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_archived ON exercises(is_archived) WHERE is_archived = true;

CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_exercise_id ON workout_sessions(exercise_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(date DESC);
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, date DESC);

CREATE INDEX idx_sets_session_id ON sets(session_id);
CREATE INDEX idx_sets_session_number ON sets(session_id, set_number);

CREATE INDEX idx_session_expire ON "session"(expire);

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