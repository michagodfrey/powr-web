# Database Schema

## 1. Users Table

| Column         | Data Type      | Constraints                               | Description                                    |
|---------------|--------------|-------------------------------------------|------------------------------------------------|
| id           | SERIAL        | PRIMARY KEY                               | Unique identifier for each user.              |
| email        | VARCHAR(255)  | UNIQUE, NOT NULL                         | User's email address (used for login).        |
| password_hash | VARCHAR(255)  | NOT NULL                                 | Hashed password for secure authentication.    |
| name         | VARCHAR(255)  |                                           | User's full name (optional).                  |
| created_at   | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP      | Timestamp indicating when the record was created. |
| updated_at   | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP      | Timestamp indicating when the record was last updated. |

---

## 2. Exercises Table

| Column      | Data Type      | Constraints                               | Description                                    |
|------------|--------------|-------------------------------------------|------------------------------------------------|
| id         | SERIAL        | PRIMARY KEY                               | Unique identifier for each exercise.          |
| user_id    | INTEGER       | NOT NULL                                  | Foreign key referencing a user (to indicate ownership). |
| name       | VARCHAR(255)  | NOT NULL                                  | Name of the exercise (e.g., Bench Press, Squat). |
| description | TEXT         |                                           | Optional description or additional notes for the exercise. |
| created_at | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP      | Timestamp indicating when the record was created. |
| updated_at | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP      | Timestamp indicating when the record was last updated. |

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Exercises Table
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
