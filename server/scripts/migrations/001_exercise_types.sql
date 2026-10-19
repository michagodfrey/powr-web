-- Adds exercise types (weighted / reps / timed) to an existing database
-- without touching data. Safe to run more than once.
-- Fresh installs get the same schema from init-database.sql.

ALTER TABLE exercises
    ADD COLUMN IF NOT EXISTS exercise_type VARCHAR(10) NOT NULL DEFAULT 'weighted';

ALTER TABLE exercises DROP CONSTRAINT IF EXISTS chk_exercise_type;
ALTER TABLE exercises
    ADD CONSTRAINT chk_exercise_type CHECK (exercise_type IN ('weighted', 'reps', 'timed'));

-- Rep-only sets have no weight; timed sets have neither weight nor reps
ALTER TABLE sets ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE sets ALTER COLUMN weight DROP NOT NULL;
ALTER TABLE sets ALTER COLUMN reps DROP NOT NULL;

ALTER TABLE sets DROP CONSTRAINT IF EXISTS chk_weight_positive;
ALTER TABLE sets DROP CONSTRAINT IF EXISTS chk_reps_positive;
ALTER TABLE sets DROP CONSTRAINT IF EXISTS chk_duration_positive;
ALTER TABLE sets DROP CONSTRAINT IF EXISTS chk_reps_or_duration;
ALTER TABLE sets
    ADD CONSTRAINT chk_weight_positive CHECK (weight IS NULL OR weight > 0),
    ADD CONSTRAINT chk_reps_positive CHECK (reps IS NULL OR reps > 0),
    ADD CONSTRAINT chk_duration_positive CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    ADD CONSTRAINT chk_reps_or_duration CHECK (reps IS NOT NULL OR duration_seconds IS NOT NULL);
