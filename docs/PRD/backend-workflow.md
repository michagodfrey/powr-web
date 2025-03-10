# Backend Development Workflow

## Overview

This document outlines the backend development workflow and best practices for the Progressive Overload Workout Recorder (POWR) project. For deployment and infrastructure details, refer to `implementation.md`.

## Related Documentation

- **Implementation** (`implementation.md`): Deployment and infrastructure setup
- **Database Schema** (`database-schema.md`): Database structure and migrations
- **API Versioning** (`api-versioning.md`): API versioning strategy
- **Error Handling** (`error-handling.md`): Error handling patterns

## Development Environment Setup

### 1. Project Initialization

```bash
# Create backend directory
mkdir server && cd server

# Initialize package.json
npm init -y

# Install core dependencies
npm install express cors body-parser dotenv helmet express-validator

# Install development dependencies
npm install --save-dev typescript @types/node @types/express nodemon jest supertest eslint prettier
```

### 2. Project Structure

```bash
server/
├── src/
│   ├── controllers/     # Request handlers & business logic
│   ├── models/         # Database models & type definitions
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic & external services
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   └── types/          # TypeScript type definitions
├── tests/
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── fixtures/      # Test data & utilities
├── scripts/           # Development & maintenance scripts
├── .env.example       # Environment variable template
├── .eslintrc.js      # ESLint configuration
├── .prettierrc       # Prettier configuration
├── jest.config.js    # Jest configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies & scripts
```

### 3. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Development Workflow

### 1. Feature Development Process

1. **Planning**

   - Review requirements
   - Design API endpoints
   - Plan database changes
   - Create test scenarios

2. **Implementation**

   - Write tests first (TDD)
   - Implement feature
   - Document changes
   - Review code locally

3. **Review & Testing**
   - Run test suite
   - Perform manual testing
   - Update documentation
   - Create pull request

### 2. Code Organization

#### Controller Example

```typescript
// src/controllers/workout.controller.ts
import { Request, Response, NextFunction } from "express";
import { WorkoutService } from "../services/workout.service";
import { CreateWorkoutDTO, UpdateWorkoutDTO } from "../types/workout";

export class WorkoutController {
  constructor(private workoutService: WorkoutService) {}

  async createWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const workoutData: CreateWorkoutDTO = req.body;
      const workout = await this.workoutService.create(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      next(error);
    }
  }

  async getWorkoutHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, exerciseId } = req.params;
      const history = await this.workoutService.getHistory(userId, exerciseId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}
```

#### Service Example

```typescript
// src/services/workout.service.ts
import { WorkoutRepository } from "../models/workout.repository";
import { CreateWorkoutDTO, WorkoutHistory } from "../types/workout";
import { calculateVolume } from "../utils/workout";

export class WorkoutService {
  constructor(private repository: WorkoutRepository) {}

  async create(data: CreateWorkoutDTO) {
    const volume = calculateVolume(data.sets);
    return this.repository.create({ ...data, totalVolume: volume });
  }

  async getHistory(
    userId: string,
    exerciseId: string
  ): Promise<WorkoutHistory> {
    const workouts = await this.repository.findByUserAndExercise(
      userId,
      exerciseId
    );
    return this.formatHistory(workouts);
  }

  private formatHistory(workouts: any[]): WorkoutHistory {
    // Format workout data for client consumption
    return {
      // ... implementation
    };
  }
}
```

### 3. API Route Organization

```typescript
// src/routes/workout.routes.ts
import { Router } from "express";
import { WorkoutController } from "../controllers/workout.controller";
import { validateWorkout } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();
const controller = new WorkoutController(/* inject dependencies */);

router.post(
  "/",
  authenticate,
  validateWorkout,
  controller.createWorkout.bind(controller)
);

router.get(
  "/history/:exerciseId",
  authenticate,
  controller.getWorkoutHistory.bind(controller)
);

export default router;
```

## Development Standards

### 1. Code Style

```javascript
// .eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
  },
};
```

### 2. Git Workflow

1. **Branch Naming**

   ```bash
   feature/add-workout-history
   bugfix/fix-volume-calculation
   refactor/optimize-queries
   ```

2. **Commit Messages**
   ```bash
   feat: add workout history endpoint
   fix: correct volume calculation for multiple sets
   refactor: optimize workout history queries
   docs: update API documentation
   ```

### 3. Testing Standards

```typescript
// tests/integration/workout.test.ts
describe("Workout API", () => {
  describe("POST /api/workouts", () => {
    it("should create a new workout with valid data", async () => {
      const workoutData = {
        exerciseId: 1,
        sets: [{ weight: 100, reps: 5 }],
      };

      const response = await request(app)
        .post("/api/workouts")
        .send(workoutData)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("totalVolume", 500);
    });
  });
});
```

## Development Tools

### 1. VS Code Configuration

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

### 2. Debugging Setup

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
      "args": ["--runInBand"]
    }
  ]
}
```

## Local Development

### 1. Development Scripts

```json
// package.json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write 'src/**/*.ts'",
    "typecheck": "tsc --noEmit"
  }
}
```

### 2. Database Management

```bash
# Create development database
npm run db:create

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Reset database (development only)
npm run db:reset
```

## Documentation

### 1. API Documentation

- Use OpenAPI/Swagger for API documentation
- Keep documentation in sync with code
- Include request/response examples
- Document error responses

### 2. Code Documentation

```typescript
/**
 * Calculates the total volume for a workout session
 * @param sets - Array of workout sets
 * @returns Total volume (weight * reps * sets)
 * @throws {ValidationError} If sets array is empty
 */
export function calculateVolume(sets: WorkoutSet[]): number {
  if (!sets.length) {
    throw new ValidationError("Workout must have at least one set");
  }
  return sets.reduce((total, set) => total + set.weight * set.reps, 0);
}
```

## Quality Assurance

### 1. Code Review Checklist

- [ ] Tests pass and coverage meets requirements
- [ ] Code follows style guide
- [ ] Error handling is appropriate
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

### 2. Performance Guidelines

- Use database indexes appropriately
- Implement caching where beneficial
- Optimize database queries
- Use connection pooling
- Monitor query performance

This backend workflow document should be reviewed and updated regularly as development practices evolve and new tools are adopted.

