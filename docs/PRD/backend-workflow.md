# Backend Workflow

Below is a proposed backend workflow for the **Progressive Overload Workout Recorder (POWR)** project. This document outlines how to structure, develop, and maintain the backend services. Since you haven't selected a hosting platform yet, the steps below remain provider-agnostic. You can apply these steps whether you choose Heroku, AWS, Railway, Render, or another service.

---

## 1. Environment Setup

1. **Initialize the Project**
   - Create a new directory for your backend (e.g., `server`).
   - Run `npm init -y` (or `yarn init -y`) to generate a `package.json`.
   - Install necessary dependencies:

     ```bash

     npm install express cors body-parser dotenv
     # or yarn add express cors body-parser dotenv
     ```

   - Install dev dependencies (for testing, linting, etc.):

     ```bash

     npm install --save-dev nodemon jest supertest eslint
     ```

2. **Directory Structure**
   - A recommended starting layout:

     ```bash

     server/
     ├── controllers/        # Request handlers (business logic)
     ├── models/             # Database models / ORM definitions
     ├── routes/             # API route definitions
     ├── config/             # Configuration files (database, environment)
     ├── tests/              # Automated tests
     ├── index.js            # Main entry point for the Express server
     ├── package.json
     └── ... other files ...
     ```

3. **Environment Variables**
   - Use a `.env` file to store sensitive or environment-specific information (e.g., DB connection strings).
   - Example `.env` structure:

     ```bash

     PORT=4000
     DATABASE_URL=postgres://username:password@localhost:5432/yourDB
     JWT_SECRET=someLongSecretKey
     ```

   - **Never** commit your `.env` file to version control. Add `.env` to your `.gitignore`.

---

## 2. Database & ORM

1. **Database Choice**
   - The PRD suggests a relational DB like **PostgreSQL**. You can also use MySQL or any SQL-based system.

2. **Connection & ORM Setup**
   - If you use Sequelize (for example):

     ```bash

     npm install sequelize pg pg-hstore
     ```

   - Create a `config/database.js` (or similar) to handle the connection:

     ```js
     const { Sequelize } = require('sequelize');

     const sequelize = new Sequelize(process.env.DATABASE_URL, {
       dialect: 'postgres',
       logging: false,
     });

     module.exports = sequelize;

     ```

- In `models/`, define your data models. For example, a simple `User` model:

     ```js
     // models/User.js
     const { DataTypes } = require('sequelize');
     const sequelize = require('../config/database');

     const User = sequelize.define('User', {
       username: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true,
       },
       password: {
         type: DataTypes.STRING,
         allowNull: false,
       },
     });

     module.exports = User;

     ```

- Repeat for `Exercise`, `Workout`, `Set`, etc.

---

## 3. API Endpoints (REST)

Below is a high-level overview of potential endpoints. Adjust as needed for your final data model.

### 3.1 Authentication & User Management

- **POST** `/auth/register`
  - Register a new user (username, password).
- **POST** `/auth/login`
  - User login. Return a JWT or session token.
- **GET** `/auth/me` (Protected)
  - Returns the current authenticated user's info (use JWT in header or cookies).

### 3.2 Exercises

- **GET** `/exercises` (Protected)
  - Get a list of all exercises for the logged-in user.
- **POST** `/exercises` (Protected)
  - Create a new exercise (e.g., name, description).
- **PUT** `/exercises/:id` (Protected)
  - Update an existing exercise.
- **DELETE** `/exercises/:id` (Protected)
  - Remove an exercise.

### 3.3 Workouts / Sets

- **GET** `/workouts` (Protected)
  - Retrieve all workout sessions or sets for the user. Supports queries like date range.
- **POST** `/workouts` (Protected)
  - Create a workout session record (date, sets, notes).
- **POST** `/workouts/:workoutId/sets` (Protected)
  - Add a set to a specific workout (weight, reps, etc.).
- **PUT** `/workouts/:workoutId/sets/:setId` (Protected)
  - Update a particular set (e.g., weight, reps).
- **DELETE** `/workouts/:workoutId/sets/:setId` (Protected)
  - Remove a set from a workout.

### 3.4 Volume & Analytics

- **GET** `/analytics/volume` (Protected)
  - Returns total volume (weight × reps) by exercise or date range.
- **GET** `/analytics/trends` (Protected)
  - Returns data formatted for charting (weekly, monthly, or custom date ranges).

---

## 4. Backend Logic & Controllers

1. **Controller Layer**
   - Each route calls a controller function that contains business logic.
   - For example, a `userController.js` with methods like `registerUser`, `loginUser`.
   - Use services or helper utilities for reusable logic (e.g., password hashing, volume calculations).

2. **Workflow Example** (User creating a workout set)
   1. **Client** sends a `POST /workouts/:workoutId/sets` request with JSON body: `{ weight: 100, reps: 5, ... }`
   2. **Auth Middleware** verifies user token.
   3. **Controller** checks if the `workoutId` belongs to the authenticated user.
   4. **Controller** calculates the volume (`weight * reps`).
   5. **Model** saves the set data to the database.
   6. **Response** returns the newly created set (or an error if something fails).

3. **Validation**
   - Validate incoming data using libraries like **Joi** or **express-validator**:

     ```js

     // Example with express-validator
     const { body } = require('express-validator');

     router.post('/exercises', [
       body('name').notEmpty().withMessage('Exercise name is required'),
     ], createExercise);
     ```

---

## 5. Testing

1. **Unit Tests**
   - Test controllers, services, and utilities independently.
   - Example with Jest:

     ```js

     // tests/controllers/userController.test.js
     const { registerUser } = require('../../controllers/userController');

     describe('registerUser', () => {
       it('should create a new user with valid data', async () => {
         // mock DB or use in-memory DB
       });
     });
     ```

2. **Integration Tests**
   - Use **supertest** to make requests against an in-memory or test server.
   - Verify that endpoints return correct status codes, data, and error messages.

3. **Test Coverage & CI**
   - Check coverage with `jest --coverage`.
   - Integrate with a CI service (GitHub Actions, GitLab CI) to run tests on each commit.

---

## 6. Deployment (Generic Steps)

> **Note:** Since you haven't chosen a hosting platform yet, these steps remain provider-neutral.

1. **Production Environment Configuration**
   - Create a production `.env` file (or environment variables in your hosting dashboard).
   - Ensure your `DATABASE_URL` references your production database.

2. **Build & Start Script**
   - Add scripts in `package.json`:

     ```json

     {
       "scripts": {
         "start": "node index.js",
         "dev": "nodemon index.js",
         "test": "jest"
       }
     }
     ```

3. **Procfile / Docker (Optional)**
   - If your host requires a `Procfile` (e.g., Heroku), add:

     ```bash

     web: node index.js

     ```

   - Or, if you're using Docker:

     ```dockerfile

     FROM node:16
     WORKDIR /usr/src/app
     COPY package*.json ./
     RUN npm install
     COPY . .
     EXPOSE 4000
     CMD ["npm", "start"]
     ```

   - Build & push your image to a container registry.

4. **Hosting Steps**
   - **Heroku**: `heroku create` → set config vars → push code.
   - **AWS (Elastic Beanstalk, ECS)**: Deploy Docker image or zip the codebase.
   - **Railway/Render**: Connect your GitHub repo, set environment variables, auto-deploy.

5. **Database Provisioning**
   - Create a production PostgreSQL instance via your host or a third-party DBaaS (e.g., Amazon RDS).
   - Update `DATABASE_URL` accordingly.
   - Run migrations or sync to initialize tables.

6. **Monitoring & Logs**
   - Configure logs via your hosting provider's dashboard.
   - Monitor CPU, memory usage, and DB performance.
   - Set up alerts or notifications (e.g., Slack, email) in case of downtime or errors.

---

## 7. Security & Best Practices

1. **HTTPS Everywhere**
   - Terminate SSL at your host or proxy (e.g., Nginx) to protect data in transit.

2. **JWT or Session Management**
   - Protect routes with middleware that verifies the token or session.
   - Set token expiration to reduce risk if credentials are leaked.

3. **Password Storage**
   - Hash user passwords with **bcrypt** or **argon2** before storing in the database.
   - Never log or store plain-text passwords.

4. **Rate Limiting**
   - Implement rate limiting to prevent brute-force attacks on login endpoints.

5. **Input Sanitization**
   - Validate all user input to guard against SQL injection, XSS, etc.

6. **Regular Dependency Updates**
   - Use tools like **npm audit** or **Dependabot** to keep packages secure.

---

## 8. Summary

This backend workflow covers the essential steps to get a functional and secure backend for POWR:

1. **Initialize** the project and configure the environment.
2. **Define database** models and relationships (Exercises, Workouts, Sets, etc.).
3. **Implement REST endpoints** to handle CRUD operations.
4. **Write tests** for controllers, routes, and business logic.
5. **Deploy** to a platform of your choice (Heroku, AWS, Railway, Render, etc.).
6. **Secure** the application by following best practices around authentication, validation, and encryption.

By following this workflow, you'll have a well-structured, maintainable, and scalable backend for your Progressive Overload Workout Recorder application.
