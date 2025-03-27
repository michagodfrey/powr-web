# Testing Strategy

## Overview

This document outlines the testing strategy for the Progressive Overload Workout Recorder (POWR) project. The strategy emphasizes reliability, maintainability, and confidence in our codebase while keeping the testing process efficient and focused on critical functionality.

## Development Phase Testing Priorities

During active feature development, we follow these testing priorities:

1. **Critical Path Testing**

   - Focus on core functionality that directly impacts user data
   - Test new features as they are built, focusing on the happy path
   - Ensure data integrity for workout tracking and volume calculations
   - Validate authentication and user session management

2. **Test Documentation**

   - Maintain a "Testing TODO" list in `docs/testing-todo.md`
   - Document edge cases as they are discovered during development
   - Track scenarios that need testing coverage in later phases
   - Note potential regression test cases

3. **Minimal Viable Testing**
   - Write basic tests for critical features during development
   - Focus on "happy path" scenarios first
   - Test data integrity points (saving, loading, calculating)
   - Defer comprehensive test coverage until features stabilize

Example Testing TODO format:

```markdown
# Testing TODO

## Critical Paths

- [ ] Workout volume calculation with various unit combinations
- [ ] Exercise history persistence across sessions
- [ ] User preference saving and loading

## Edge Cases to Test Later

- [ ] Handle extremely large volume numbers
- [ ] Multiple concurrent workout sessions
- [ ] Network interruption during save

## Regression Scenarios

- [ ] Verify volume calculations after unit conversion
- [ ] Check exercise list after deletion and recreation
```

## Core Testing Principles

1. **Prioritize Business Value**

   - Focus on testing features that directly impact users
   - Prioritize critical paths and data integrity
   - Start with "happy path" testing during development
   - Add edge cases and comprehensive testing as features stabilize

2. **Keep Tests Simple**

   - Write clear, focused tests
   - One assertion per test when possible
   - Use descriptive test names that explain the behavior being tested
   - Document test scenarios even if not implementing immediately

3. **Maintain Test Independence**

   - Each test should be able to run in isolation
   - No shared state between tests
   - Clean up after each test
   - Document dependencies for future test implementation

4. **Progressive Testing Strategy**
   - Begin with critical path testing during development
   - Document edge cases and scenarios as discovered
   - Build comprehensive test suite as features stabilize
   - Maintain a clear testing roadmap

## Test Types

### 1. Unit Tests

**Scope**: Individual functions and components  
**Tools**: Jest, React Testing Library

**Key Areas**:

- Volume calculation functions
- Data transformation utilities
- Form validation logic
- React components (in isolation)
- API request handlers

**Coverage Requirements**:

- Minimum 80% coverage for utility functions
- 100% coverage for volume calculations
- 70% coverage for React components

### 2. Integration Tests

**Scope**: Component interactions and API endpoints  
**Tools**: Jest, Supertest

**Key Areas**:

- API endpoint behavior
- Database operations
- Authentication flows
- Multi-component interactions

**Coverage Requirements**:

- 80% coverage for API endpoints
- Key user flows must be fully tested

### 3. End-to-End Tests

**Scope**: Complete user flows  
**Tools**: Playwright

**Key Flows**:

1. User authentication (Google OAuth)
2. Exercise creation and management
3. Workout data entry
4. Progress visualization
5. Data export

**Requirements**:

- Test on multiple browsers (Chrome, Firefox, Safari)
- Include mobile viewport testing
- Run tests on staging environment before production

## Test Environment Setup

### 1. Development Environment

```typescript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};
```

### 2. Test Database

- Use a separate test database
- Run migrations before test suite
- Clear data between test runs
- Use seeded test data for consistent results

### 3. Environment Variables

```bash
TEST_DATABASE_URL=postgresql://localhost:5432/powr_test
TEST_GOOGLE_CLIENT_ID=test_client_id
TEST_GOOGLE_CLIENT_SECRET=test_client_secret
```

## Test Data Management

### 1. Test Data Principles

- Use factories for generating test data
- Maintain realistic data relationships
- Clear separation between test and development data
- Version control test data alongside code

### 2. Factory Setup

```typescript
// factories/user.ts
export const createTestUser = (overrides = {}) => ({
  name: "Test User",
  email: "test@example.com",
  googleId: "test_google_id",
  ...overrides,
});

// factories/exercise.ts
export const createTestExercise = (overrides = {}) => ({
  name: "Bench Press",
  userId: 1,
  ...overrides,
});
```

## Continuous Integration

### 1. GitHub Actions Configuration

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: powr_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:ci
```

## Testing Guidelines

### 1. Unit Test Structure

```typescript
describe("VolumeCalculator", () => {
  describe("calculateTotalVolume", () => {
    it("should calculate volume correctly for single set", () => {
      const set = { weight: 100, reps: 5 };
      expect(calculateTotalVolume([set])).toBe(500);
    });

    it("should handle empty sets", () => {
      expect(calculateTotalVolume([])).toBe(0);
    });
  });
});
```

### 2. Integration Test Structure

```typescript
describe("Exercise API", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("should create new exercise for authenticated user", async () => {
    const user = await createTestUser();
    const response = await request(app)
      .post("/api/exercises")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ name: "Squat" });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Squat");
  });
});
```

### 3. E2E Test Structure

```typescript
test("user can log workout and view progress", async ({ page }) => {
  await page.goto("/");
  await loginWithGoogle(page);
  await page.click('[data-testid="add-exercise"]');
  await page.fill('[data-testid="exercise-name"]', "Deadlift");
  // ... continue with user flow
});
```

## Error Handling in Tests

1. **Async Operations**

   - Always use proper async/await
   - Handle promise rejections
   - Set appropriate timeouts

2. **Database Operations**

   - Handle connection errors
   - Implement proper cleanup
   - Use transactions where appropriate

3. **External Services**
   - Mock Google OAuth in tests
   - Provide fallback responses
   - Test error scenarios

## Performance Testing

1. **Load Testing**

   - Test concurrent user scenarios
   - Verify database query performance
   - Monitor memory usage

2. **Response Times**
   - API endpoints should respond within 200ms
   - Page loads should complete within 1s
   - Charts should render within 500ms

## Monitoring & Reporting

1. **Coverage Reports**

   - Generate after each test run
   - Include in CI/CD pipeline
   - Track trends over time

2. **Test Results**
   - Clear pass/fail indicators
   - Detailed error messages
   - Time taken for test suite

## Documentation Requirements

1. **Test Documentation**

   - Document test setup procedures
   - Maintain list of test accounts/data
   - Update testing guide for new features

2. **Review Process**
   - Tests reviewed with code changes
   - Coverage reports in PR reviews
   - Performance impact considered

This testing strategy is a living document and should be updated as the project evolves and new testing requirements emerge.
