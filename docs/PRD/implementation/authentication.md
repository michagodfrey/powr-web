# Authentication Specification

## Overview

POWR uses JWT-based authentication exclusively for all authentication methods:

- Google OAuth (implemented)
- Email/Password (implemented)
- Apple Sign-In (planned for mobile release)

This approach provides:

- Consistent authentication across all platforms
- Simplified, stateless authentication flow
- Easy mobile integration
- Elimination of session/cookie management
- Clear path for future authentication methods

## Implementation Requirements

### Authentication Flow

1. **Login Methods**

   - **Google OAuth**:

     - Standard OAuth 2.0 flow
     - Convert successful OAuth to JWT
     - Return JWT to client

   - **Email/Password**:

     - Direct JWT issuance on successful login
     - Secure password hashing with bcrypt

   - **Apple Sign-In** (future):
     - Will follow same pattern as Google OAuth
     - Planned for mobile app release

2. **Token Management**

   - Use JWTs exclusively for all authentication
   - No session state maintained
   - Access tokens: short-lived (15 minutes)
   - Refresh tokens: long-lived (14 days)
   - Token storage:
     - Web: localStorage for access tokens
     - Mobile: secure storage (planned)

3. **Logout**
   - Clear tokens from client storage
   - Future: Implement token revocation

### Data Storage

1. **User Model**

   ```typescript
   interface User {
     id: number;
     email: string;
     name: string;
     picture?: string;
     googleId?: string; // Optional for Google OAuth
     appleId?: string; // Optional for Apple Sign-In
     passwordHash?: string; // Optional for email/password
     preferredUnit: "kg" | "lb";
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **Token Handling**
   - No server-side session storage
   - Future: Implement refresh token tracking for revocation

### Security Requirements

1. **JWT Configuration**

   - Strong signing keys (env var)
   - Short access token lifetime
   - CORS configuration for web/mobile clients

2. **Environment Variables**

   ```bash
   # OAuth settings
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   APPLE_CLIENT_ID=your_apple_client_id      # Future
   APPLE_CLIENT_SECRET=your_apple_client_secret  # Future

   # JWT configuration
   JWT_SECRET=your_jwt_secret
   JWT_ACCESS_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=14d  # Future

   # URLs
   CLIENT_URL=http://localhost:5173     # Development
   SERVER_URL=http://localhost:4000     # Development
   MOBILE_URL=your_mobile_app_scheme    # Future
   ```

## Non-Requirements

1. **Explicitly NOT Needed**
   - Session/cookie-based authentication
   - Multiple simultaneous auth methods per user
   - CSRF protection (JWT in Authorization header)
   - Multi-factor authentication (for now)
   - Password reset flow (future enhancement)
   - Email verification (future enhancement)

## Error Handling

1. **Authentication Failures**

   - Clear error messages for all failure modes
   - Proper HTTP status codes (401, 403)
   - Logging for security monitoring

2. **Token Errors**
   - 401 for expired/invalid tokens
   - Future: Automatic token refresh

## Testing Requirements

1. **Test Cases**
   - JWT issuance and validation
   - Google OAuth flow
   - Email/password authentication
   - Token expiration handling
   - Error cases and validation

## Future Considerations

1. **Immediate Next Steps**

   - Complete refresh token implementation
   - Add Apple Sign-In for mobile
   - Implement secure token storage for mobile

2. **Later Enhancements**
   - Password reset flow
   - Email verification
   - Multi-factor authentication
   - Enhanced security measures

These requirements supersede all previous authentication specifications.
