-- PostgreSQL Database Initialization Script (Current Schema)
-- Sets up tables for POWR: users, exercises, workout_sessions, sets.
-- Auth (credentials, sessions, Google OAuth) is handled entirely by Supabase Auth
-- (the auth.users table it manages) — users.id here is that same UUID.
--
-- Row Level Security: every table is exposed by Supabase's auto-generated REST
-- API to the anon/authenticated keys by default. The Express API connects via
-- the direct Postgres connection string as the table owner, which bypasses
-- RLS entirely (Postgres doesn't apply RLS to owners unless FORCE ROW LEVEL
-- SECURITY is set) — so none of this affects the API. It's a second line of
-- defense: if the anon/authenticated key were ever used directly against
-- Supabase's REST API, these policies keep everyone scoped to their own rows.
-- auth.uid() is a Supabase-provided function. On a real Supabase project it
-- already exists, so this no-ops there; on a vanilla local Postgres (local
-- dev) it doesn't, so this stubs in a schema/function that always returns
-- NULL — harmless since RLS is bypassed by the API's table-owner connection
-- anyway, and this only fires when auth.uid() is genuinely absent, so it can
-- never clobber Supabase's real implementation.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $fn$
      SELECT NULL::uuid
    $fn$;
  END IF;
END $$;

-- Drop legacy tables from earlier (pre-Supabase) auth designs if they exist
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;

-- Drop tables if they exist (in dependency order)
DROP TABLE IF EXISTS sets;
DROP TABLE IF EXISTS workout_sessions;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS users;

-- Users table — id matches Supabase's auth.users.id (UUID); this table only
-- holds app-specific profile data. Not declared as a literal FK to auth.users
-- since local/dev Postgres instances won't have that schema.
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture VARCHAR(1024),
    preferred_unit VARCHAR(2) NOT NULL DEFAULT 'kg',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_preferred_unit CHECK (preferred_unit IN ('kg', 'lb'))
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Exercises table
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT exercises_user_id_name_unique UNIQUE (user_id, name)
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercises" ON exercises
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercises" ON exercises
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON exercises
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON exercises
    FOR DELETE USING (auth.uid() = user_id);

-- Workout sessions table
CREATE TABLE workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    total_volume DECIMAL(10,2) NOT NULL,
    unit VARCHAR(2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit CHECK (unit IN ('kg', 'lb'))
);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout sessions" ON workout_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions" ON workout_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON workout_sessions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON workout_sessions
    FOR DELETE USING (auth.uid() = user_id);

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

ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- sets has no user_id of its own — ownership is scoped through its workout_session
CREATE POLICY "Users can view own sets" ON sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE workout_sessions.id = sets.session_id
            AND workout_sessions.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own sets" ON sets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE workout_sessions.id = sets.session_id
            AND workout_sessions.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own sets" ON sets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE workout_sessions.id = sets.session_id
            AND workout_sessions.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete own sets" ON sets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE workout_sessions.id = sets.session_id
            AND workout_sessions.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX idx_exercises_user ON exercises(user_id);
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_exercise ON workout_sessions(exercise_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(date DESC);
CREATE INDEX idx_sets_session ON sets(session_id);
