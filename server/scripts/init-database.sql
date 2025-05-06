-- PostgreSQL Database Initialization Script (Current Schema)
-- Sets up tables for POWR: users, exercises, workout_sessions, sets, refresh_tokens

-- Drop legacy session tables if they exist
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS session CASCADE;

-- Drop tables if they exist (in dependency order)
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS sets;
DROP TABLE IF EXISTS workout_sessions;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture VARCHAR(1024),
    preferred_unit VARCHAR(2) NOT NULL DEFAULT 'kg',
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_preferred_unit CHECK (preferred_unit IN ('kg', 'lb'))
);

-- Exercises table
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT exercises_user_id_name_unique UNIQUE (user_id, name)
);

-- Workout sessions table
CREATE TABLE workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    total_volume DECIMAL(10,2) NOT NULL,
    unit VARCHAR(2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit CHECK (unit IN ('kg', 'lb'))
);

-- Sets table
CREATE TABLE sets (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight DECIMAL(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    unit VARCHAR(2) NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit CHECK (unit IN ('kg', 'lb')),
    CONSTRAINT chk_weight_positive CHECK (weight > 0),
    CONSTRAINT chk_reps_positive CHECK (reps > 0)
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    device VARCHAR(255),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_exercises_user ON exercises(user_id);
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_exercise ON workout_sessions(exercise_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(date DESC);
CREATE INDEX idx_sets_session ON sets(session_id);
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens(user_id);
CREATE INDEX refresh_tokens_token_idx ON refresh_tokens(token);

-- Triggers for updated_at (optional, if you want automatic timestamp updates)
-- You may need to add a trigger function in a separate migration if desired. 