# API Versioning Strategy

## Overview

This document outlines the API versioning strategy for the Progressive Overload Workout Recorder (POWR) project. The strategy ensures a stable, predictable API that can evolve while maintaining backwards compatibility for existing clients.

## Core Versioning Principles

1. **Semantic Versioning**

   - Major version changes for breaking changes
   - Minor version changes for backwards-compatible features
   - Patch version changes for backwards-compatible fixes

2. **Backwards Compatibility**

   - Maintain support for previous versions
   - Clear deprecation timeline
   - Graceful degradation

3. **Clear Documentation**
   - Version-specific documentation
   - Migration guides
   - Changelog maintenance

## Version Format

### 1. URL-Based Versioning

```typescript
// Base URL format
const API_BASE = "/api/v{major}";

// Example endpoints
GET / api / v1 / exercises;
GET / api / v2 / exercises;
```

### 2. Version Header Support

```typescript
// Optional version header
Accept: application / json;
version = 1.2;
```

## Implementation Guidelines

### 1. Route Configuration

```typescript
// src/routes/index.ts
import { Router } from "express";
import v1Routes from "./v1";
import v2Routes from "./v2";

const router = Router();

router.use("/v1", v1Routes); // Original version
router.use("/v2", v2Routes); // New version with breaking changes

export default router;
```

### 2. Version Controller

```typescript
// src/middleware/version.ts
interface VersionConfig {
  minVersion: string;
  currentVersion: string;
  deprecatedVersions: string[];
}

const versionConfig: VersionConfig = {
  minVersion: "1.0",
  currentVersion: "2.0",
  deprecatedVersions: ["1.0"],
};

export const versionMiddleware = (req, res, next) => {
  const version = req.headers["accept-version"] || currentVersion;

  if (deprecatedVersions.includes(version)) {
    res.set("X-API-Warn", "This API version is deprecated");
  }

  req.apiVersion = version;
  next();
};
```

## Version Management

### 1. Breaking Changes

**Examples of Breaking Changes**:

- Removing fields from responses
- Changing field types
- Modifying endpoint URLs
- Changing authentication methods

**Handling Strategy**:

1. Create new endpoint in new version
2. Maintain old endpoint in previous version
3. Document changes and migration path
4. Set deprecation timeline

### 2. Non-Breaking Changes

**Examples of Non-Breaking Changes**:

- Adding new optional fields
- Adding new endpoints
- Adding new query parameters
- Extending enums

**Handling Strategy**:

1. Implement changes in current version
2. Maintain backwards compatibility
3. Document new features
4. No version bump needed

## Response Headers

```typescript
interface VersionHeaders {
  "X-API-Version": string; // Current API version
  "X-API-Deprecated": boolean; // Whether version is deprecated
  "X-API-Sunset": string; // When version will be removed
}
```

## Documentation Requirements

### 1. Version-Specific Docs

```markdown
# API Documentation v2.0

## Changes from v1.0

- Added volume calculation endpoint
- Modified exercise response format
- Deprecated individual set endpoints

## New Features

- Batch operation support
- Enhanced filtering options
- Real-time updates
```

### 2. Changelog Format

```markdown
# Changelog

## [2.0.0] - 2024-03-08

### Breaking Changes

- Changed exercise response format
- Removed individual set endpoints

### Added

- Batch operation support
- Real-time update endpoints

### Changed

- Enhanced filtering options
- Improved error responses

## [1.2.0] - 2024-02-15

### Added

- New optional fields for exercises
- Additional query parameters
```

## Migration Support

### 1. Migration Guide Template

```markdown
# Migrating from v1 to v2

## Key Changes

1. Exercise Response Format
   - Before: { id, name, sets: [] }
   - After: { id, name, sessions: [] }

## Required Updates

1. Update exercise fetching logic
2. Modify set handling
3. Update error handling

## Migration Steps

1. Update API client version
2. Modify response parsing
3. Test with v2 endpoints
```

### 2. Compatibility Layer

```typescript
// src/compatibility/v1tov2.ts
export const convertV1Exercise = (exercise: V1Exercise): V2Exercise => ({
  id: exercise.id,
  name: exercise.name,
  sessions: exercise.sets.map(convertV1SetToSession),
});
```

## Deprecation Policy

### 1. Timeline

| Stage      | Duration | Actions         |
| ---------- | -------- | --------------- |
| Active     | Current  | Full support    |
| Deprecated | 6 months | Warning headers |
| Sunset     | 1 month  | Error responses |
| Removed    | -        | 410 Gone        |

### 2. Communication

```typescript
interface DeprecationNotice {
  version: string;
  deprecationDate: Date;
  sunsetDate: Date;
  migrationGuide: string;
  alternativeEndpoint?: string;
}
```

## Testing Requirements

### 1. Version-Specific Tests

```typescript
describe("API v2", () => {
  describe("Exercise Endpoints", () => {
    it("should return v2 format", async () => {
      const response = await request(app)
        .get("/api/v2/exercises")
        .set("Accept-Version", "2.0");

      expect(response.body).toMatchSchema(v2ExerciseSchema);
    });
  });
});
```

### 2. Compatibility Tests

```typescript
describe("Version Compatibility", () => {
  it("should handle v1 requests with v2 backend", async () => {
    const response = await request(app)
      .get("/api/v1/exercises")
      .set("Accept-Version", "1.0");

    expect(response.body).toMatchSchema(v1ExerciseSchema);
  });
});
```

## Monitoring & Metrics

### 1. Version Usage Tracking

```typescript
interface VersionMetrics {
  version: string;
  requestCount: number;
  errorRate: number;
  avgResponseTime: number;
  uniqueClients: number;
}
```

### 2. Alerts

- Alert on deprecated version usage increase
- Monitor error rates by version
- Track client migration progress

## Implementation Checklist

### 1. New Version Release

- [ ] Document breaking changes
- [ ] Create migration guide
- [ ] Implement new endpoints
- [ ] Add version-specific tests
- [ ] Update documentation
- [ ] Deploy with backwards compatibility
- [ ] Monitor for issues

### 2. Version Deprecation

- [ ] Announce deprecation
- [ ] Set deprecation headers
- [ ] Monitor usage
- [ ] Send notifications
- [ ] Update documentation
- [ ] Plan removal

This API versioning strategy should be reviewed and updated as the application evolves and new requirements emerge.
