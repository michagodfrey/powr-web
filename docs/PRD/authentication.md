# Authentication Specification

## Overview

POWR uses Google OAuth as its sole authentication method. This decision was made to:

- Simplify the user experience
- Leverage Google's secure authentication infrastructure
- Eliminate the need for password management
- Provide a familiar login experience

## Implementation Requirements

### Authentication Flow

1. **Login**

   - Users click "Sign in with Google" button
   - Redirect to Google OAuth consent screen
   - Upon successful Google authentication, redirect back to app
   - Create or update user record with Google profile data
   - Establish user session
   - Redirect to dashboard

2. **Session Management**

   - Use Express session with PostgreSQL store
   - Session duration: 14 days (two weeks)
   - Session persists across page refreshes
   - No need for manual token management

3. **Logout**
   - Clear server-side session
   - Redirect to login page

### Data Storage

1. **User Model**

   ```typescript
   interface User {
     id: number;
     googleId: string; // Google's unique identifier
     email: string; // User's Google email
     name: string; // User's Google display name
     picture?: string; // Google profile picture URL
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **Session Storage**
   - Use `connect-pg-simple` for PostgreSQL session storage
   - Store only essential session data
   - Implement proper session cleanup

### Security Requirements

1. **Session Configuration**

   - HTTP-only cookies
   - Secure in production
   - SameSite policy: Lax
   - CORS configuration matching frontend domain

2. **Environment Variables**

   ```bash
   # Required OAuth settings
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret

   # Session configuration
   SESSION_SECRET=your_session_secret

   # URLs
   CLIENT_URL=http://localhost:5173     # Development
   SERVER_URL=http://localhost:4000     # Development
   ```

## Non-Requirements

1. **Explicitly NOT Needed**
   - Email/password authentication
   - JWT tokens
   - Remember me functionality
   - Multi-factor authentication
   - Password reset flow
   - Email verification
   - Multiple OAuth providers

## Error Handling

1. **Authentication Failures**

   - Redirect to login page with error message
   - Clear error messages for common issues
   - Log authentication failures for monitoring

2. **Session Errors**
   - Automatic redirect to login on session expiration
   - Clear feedback when session is invalid

## Testing Requirements

1. **Test Cases**
   - Successful Google OAuth flow
   - Session persistence across page refreshes
   - Proper session expiration
   - Logout functionality
   - Error cases (invalid session, network issues)

## Future Considerations

1. **Potential Additions**
   - Session duration configuration
   - Remember me functionality
   - Additional OAuth providers
   - Enhanced security measures

These requirements supersede any previous authentication-related specifications.
