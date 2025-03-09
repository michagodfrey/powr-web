# Database Schema

## Overview

This document defines the database schema for the Progressive Overload Workout Recorder (POWR) application. The schema is designed to support workout tracking, progressive overload monitoring, and user management while maintaining data integrity and performance.

## Tables

### 1. Users Table

| Column         | Data Type    | Constraints                         | Description                          |
| -------------- | ------------ | ----------------------------------- | ------------------------------------ |
| id             | SERIAL       | PRIMARY KEY                         | Unique identifier for each user      |
| google_id      | VARCHAR(255) | UNIQUE, NOT NULL                    | Google OAuth ID for authentication   |
| email          | VARCHAR(255) | UNIQUE, NOT NULL                    | User's email address                 |
| name           | VARCHAR(255) | NOT NULL                            | User's full name                     |
| picture        | VARCHAR(512) |                                     | URL to user's profile picture        |
| preferred_unit | VARCHAR(2)   | NOT NULL, DEFAULT 'kg'              | User's preferred weight unit (kg/lb) |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp            |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record update timestamp              |

### 2. Exercises Table

| Column      | Data Type    | Constraints                         | Description                         |
| ----------- | ------------ | ----------------------------------- | ----------------------------------- |
| id          | SERIAL       | PRIMARY KEY                         | Unique identifier for each exercise |
| user_id     | INTEGER      | NOT NULL, REFERENCES users(id)      | Foreign key to users table          |
| name        | VARCHAR(255) | NOT NULL                            | Exercise name (e.g., Bench Press)   |
| description | TEXT         |                                     | Optional exercise description       |
| is_archived | BOOLEAN      | NOT NULL, DEFAULT false             | Whether exercise is archived        |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp           |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record update timestamp             |

### 3. Workout_Sessions Table

| Column       | Data Type     | Constraints                         | Description                              |
| ------------ | ------------- | ----------------------------------- | ---------------------------------------- |
| id           | SERIAL        | PRIMARY KEY                         | Unique identifier for each session       |
| user_id      | INTEGER       | NOT NULL, REFERENCES users(id)      | Foreign key to users table               |
| exercise_id  | INTEGER       | NOT NULL, REFERENCES exercises(id)  | Foreign key to exercises table           |
| date         | DATE          | NOT NULL                            | Date of the workout session              |
| notes        | TEXT          |                                     | Optional session notes                   |
| total_volume | DECIMAL(10,2) | NOT NULL                            | Total volume (weight × reps) for session |
| unit         | VARCHAR(2)    | NOT NULL                            | Weight unit used (kg/lb)                 |
| created_at   | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp                |
| updated_at   | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record update timestamp                  |

### 4. Sets Table

| Column     | Data Type     | Constraints                               | Description                           |
| ---------- | ------------- | ----------------------------------------- | ------------------------------------- |
| id         | SERIAL        | PRIMARY KEY                               | Unique identifier for each set        |
| session_id | INTEGER       | NOT NULL, REFERENCES workout_sessions(id) | Foreign key to workout_sessions table |
| set_number | INTEGER       | NOT NULL                                  | Order of set within session           |
| weight     | DECIMAL(6,2)  | NOT NULL                                  | Weight used for the set               |
| reps       | INTEGER       | NOT NULL                                  | Number of repetitions                 |
| unit       | VARCHAR(2)    | NOT NULL                                  | Weight unit (kg/lb)                   |
| volume     | DECIMAL(10,2) | NOT NULL                                  | Set volume (weight × reps)            |
| created_at | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP       | Record creation timestamp             |
| updated_at | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP       | Record update timestamp               |

### 5. Sessions Table

| Column     | Data Type | Constraints                         | Description                        |
| ---------- | --------- | ----------------------------------- | ---------------------------------- |
| id         | SERIAL    | PRIMARY KEY                         | Unique identifier for each session |
| user_id    | INTEGER   | NOT NULL, REFERENCES users(id)      | Foreign key to users table         |
| expires    | TIMESTAMP | NOT NULL                            | Session expiration timestamp       |
| data       | TEXT      | NOT NULL                            | Session data (JSON)                |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp          |

## SQL Creation Scripts

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture VARCHAR(512),
    preferred_unit VARCHAR(2) NOT NULL DEFAULT 'kg',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_preferred_unit CHECK (preferred_unit IN ('kg', 'lb'))
);

-- 2. Exercises Table
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Workout_Sessions Table
CREATE TABLE workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    total_volume DECIMAL(10,2) NOT NULL,
    unit VARCHAR(2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit CHECK (unit IN ('kg', 'lb'))
);

-- 4. Sets Table
CREATE TABLE sets (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight DECIMAL(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    unit VARCHAR(2) NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit CHECK (unit IN ('kg', 'lb')),
    CONSTRAINT chk_weight_positive CHECK (weight > 0),
    CONSTRAINT chk_reps_positive CHECK (reps > 0)
);

-- 5. Sessions Table (for connect-pg-simple session store)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_exercises_user ON exercises(user_id);
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_exercise ON workout_sessions(exercise_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(date DESC);
CREATE INDEX idx_sets_session ON sets(session_id);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
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
```

## Key Changes & Improvements

1. **Authentication**

   - Removed password-related fields in favor of Google OAuth
   - Added `google_id` and `picture` fields for OAuth integration

2. **Data Integrity**

   - Added CHECK constraints for units and positive numbers
   - Implemented CASCADE deletion for related records
   - Added triggers for automatic `updated_at` maintenance

3. **Performance**

   - Added indexes for common query patterns
   - Optimized data types for storage efficiency
   - Added composite indexes for frequent joins

4. **Session Management**

   - Added sessions table for `connect-pg-simple`
   - Included session expiration handling
   - Added index for expired session cleanup

5. **Workout Tracking**
   - Separated sessions and sets for better organization
   - Added volume calculations at both set and session levels
   - Maintained unit consistency with constraints

This schema provides a solid foundation for the POWR application while maintaining data integrity, performance, and scalability.
