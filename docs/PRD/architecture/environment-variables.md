# Environment Variables Reference

## Overview

This document serves as the central reference for all environment variables used in the POWR application. It includes variables for both development and production environments, with explanations and example values.

## Core Variables

### Application Settings

```bash
# Server Configuration
PORT=4000                           # API server port
NODE_ENV=development                # Environment (development/production)
API_URL=http://localhost:4000       # Backend API URL
CLIENT_URL=http://localhost:5173    # Frontend application URL
```

### Authentication

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id          # From Google Cloud Console
GOOGLE_CLIENT_SECRET=your_client_secret  # From Google Cloud Console

# Session Configuration
SESSION_SECRET=your_session_secret       # Long random string for session encryption
SESSION_DURATION=1209600000             # Session duration in ms (default: 14 days)
```

### Database Configuration

```bash
# Main Database
DATABASE_URL=postgresql://user:password@localhost:5432/powr    # Main database connection string

# Test Database
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/powr_test  # Test database connection string
```

## Development-Specific Variables

```bash
# Development Settings
DEBUG=true                          # Enable debug logging
CORS_ORIGIN=http://localhost:5173   # Allow local frontend development
```

## Production-Specific Variables

```bash
# Production Settings
CORS_ORIGIN=https://app.powr.com    # Production frontend URL
SENTRY_DSN=your_sentry_dsn          # Error tracking
NEW_RELIC_LICENSE_KEY=your_key      # Performance monitoring
```

## Monitoring & Logging

```bash
# Monitoring Configuration
LOG_LEVEL=info                      # Logging level (debug/info/warn/error)
SENTRY_ENVIRONMENT=production       # Environment tag for Sentry
DATADOG_API_KEY=your_api_key       # Datadog monitoring
```

## Backup & Storage

```bash
# Backup Configuration
BACKUP_S3_BUCKET=powr-backups      # S3 bucket for backups
BACKUP_GCS_BUCKET=powr-backups     # GCS bucket for backups
AWS_ACCESS_KEY_ID=your_key         # AWS credentials for backups
AWS_SECRET_ACCESS_KEY=your_secret  # AWS credentials for backups
```

## Required vs Optional Variables

### Required in All Environments

- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `CLIENT_URL`
- `API_URL`

### Required in Production Only

- `SENTRY_DSN`
- `CORS_ORIGIN`
- Backup credentials (if using cloud backup)

### Optional Variables

- `DEBUG`
- `LOG_LEVEL`
- `DATADOG_API_KEY`
- `NEW_RELIC_LICENSE_KEY`

## Environment Setup

### Development Setup

1. Create `.env` file in project root:

   ```bash
   cp .env.example .env
   ```

2. Configure required variables:

   ```bash
   # Required for development
   DATABASE_URL=postgresql://localhost:5432/powr
   GOOGLE_CLIENT_ID=your_development_client_id
   GOOGLE_CLIENT_SECRET=your_development_client_secret
   SESSION_SECRET=any_long_random_string
   ```

### Production Setup

1. Configure in deployment platform (Vercel, Railway.app, etc.)
2. Ensure all required production variables are set
3. Use secure secrets management
4. Rotate sensitive credentials regularly

## Security Considerations

1. **Never commit `.env` files**

   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Production Secrets**

   - Use deployment platform's secrets management
   - Rotate credentials regularly
   - Use different values for each environment

3. **Access Control**
   - Limit access to production credentials
   - Log access to sensitive variables
   - Use least-privilege principle

## Validation

The application validates environment variables on startup:

```typescript
// Required variables check
const requiredVars = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SESSION_SECRET",
  "CLIENT_URL",
  "API_URL",
];

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**

   - Verify DATABASE_URL format
   - Check database credentials
   - Confirm network access

2. **Authentication Problems**

   - Verify Google OAuth credentials
   - Check allowed redirect URIs
   - Confirm CLIENT_URL matches OAuth settings

3. **Session Issues**
   - Verify SESSION_SECRET is set
   - Check session duration
   - Confirm cookie settings

This document should be updated whenever new environment variables are added or existing ones are modified.
