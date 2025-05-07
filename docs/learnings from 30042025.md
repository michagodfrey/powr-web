# Project Learnings and Decisions

## The Development So Far

The Progressive Overload Workout Recorder (POWR) began as a web-based application focused on tracking workout progress with an emphasis on progressive overload. Key developments and transitions include:

**Initial Development & Challenges (Early 2024)**:

- Built initial web app with React + TypeScript frontend and Express.js + PostgreSQL backend
- Implemented Google OAuth authentication for user management
- Encountered persistent authentication issues specific to Firefox
- Made strategic decision to prioritize core functionality and future mobile development over browser-specific fixes

**Authentication Evolution (April 2025)**:

- Transitioning from session/cookie-based to JWT-based authentication
- Expanding authentication methods to include:
  - Google OAuth (existing)
  - Apple Sign-In (planned)
  - Email/Password (in progress)
- Modified database schema to support multiple authentication methods
- Created comprehensive authentication migration checklist to track changes

**Current State**:

- Successfully modified user table schema to support password-based authentication
- Working on implementing secure password hashing and JWT token management
- Following structured migration plan via authentication-migration-checklist.md
- Maintaining focus on mobile-first development approach
- Planning voice input capabilities for future enhancement

**Core Features**:

- Exercise tracking and management
- Workout session recording with volume calculations
- Progress visualization with charts
- Dark/light theme support
- Cross-platform data persistence

This transition represents a significant evolution from the initial single-auth web app toward a more robust, multi-platform solution with diverse authentication options.

## How to Use This Document (do not delete)

1. **Add a New Entry**  
   Whenever a milestone is reached or a significant change is made, create a new heading (e.g., `### [YYYY-MM-DD]: Heading Text`) to detail:

   - What was changed or learned.
   - Why this change or insight matters.
   - Next steps or action items.

2. **Keep It Concise**  
   Focus on bullet points and short explanations so the document remains easy to read and update.

3. **Document Decisions**  
   If a design or architectural choice is made, record the reasoning. This will help future contributors understand the project's evolution.

4. **Reflect Often**  
   Look back on previous entries to avoid repeating mistakes and to see how the project has progressed over time.

---

## Entries

### 2024-04-28: Firefox Authentication Challenges and Strategic Direction

**What Happened**:

1. **Authentication Challenges**:

   - Encountered persistent session management issues specific to Firefox
   - Multiple attempts to resolve session persistence and authentication:
     - Implemented session saving before redirect
     - Adjusted cookie and session configurations
     - Modified sameSite attributes and cookie domain settings
   - Despite various approaches, Firefox-specific authentication issues remain unresolved

2. **Strategic Decision**:

   - After cost-benefit analysis of further Firefox-specific debugging:
     - Acknowledging Chrome works as intended
     - Resources better allocated to forward-looking features
     - Core functionality remains accessible through supported browsers

3. **Future Direction**:
   - Prioritizing development of voice input capabilities
   - Planning transition to mobile application development
   - Web app to serve as foundation for mobile version

**Why It Matters**:

1. **Resource Allocation**:

   - Development time better spent on new features than browser-specific issues
   - Voice input functionality offers unique value proposition
   - Mobile development aligns with user accessibility goals

2. **Project Evolution**:
   - Web app serves as MVP and proof of concept
   - Voice input feature will enhance user experience
   - Mobile app development represents natural progression

**Next Steps**:

1. **Voice Input Development**:

   - Research voice recognition APIs and libraries
   - Plan voice input user interface
   - Design voice command structure
   - Create voice input prototype

2. **Mobile Development Preparation**:

   - Evaluate mobile framework options
   - Plan data migration strategy
   - Design mobile-first interfaces
   - Consider offline functionality

3. **Documentation**:
   - Document known browser compatibility issues
   - Update system requirements
   - Create voice input documentation
   - Plan mobile development roadmap

---

### 2025-04-30: Authentication Strategy Overhaul for Mobile Readiness

**What Happened**:

- Strategic decision to expand authentication methods beyond Google OAuth.
- Will now support:
  - Google OAuth
  - Apple Sign-In
  - Email/Password authentication
- Transitioning from session/cookie-based authentication to JWT-based authentication for all platforms (web, mobile, voice input).
- Focus is on reliability, cross-platform compatibility, and future mobile/voice input support.
- Security enhancements like CSRF protection are deferred for now to prioritize core auth reliability and mobile readiness.

**Why It Matters**:

- Session/cookie-based auth has proven unreliable across browsers (notably Firefox) and is not ideal for mobile or API-first architectures.
- JWT-based auth is stateless, more scalable, and better suited for mobile and multi-device scenarios.
- Supporting Apple Sign-In is required for iOS apps and broadens user accessibility.
- Email/password support is essential for users who do not use Google or Apple accounts.
- This change lays the foundation for a robust, future-proof authentication system.

**Next Steps**:

1. Update PRD to reflect new authentication requirements (done).
2. Design and implement JWT-based authentication flows for all providers.
3. Add refresh token management and token revocation endpoints.
4. Update user model and database schema to support multiple providers and refresh tokens.
5. Implement and test new login, token issuance, and renewal flows.
6. Plan for migration of existing users (link Google accounts to new system).
7. Defer CSRF and advanced security features until after core auth is reliable and mobile-ready.

**Supersedes**:

- All previous Google-only and session-based authentication decisions.
- Previous assumptions about single-provider or session/cookie-only auth.

### 2025-04-30: Auth System Update - Making google_id Nullable

**What Happened:**

- Modified the users table schema to make `google_id` nullable
- This change was necessary to support both Google OAuth and email/password authentication methods
- Previously, the NOT NULL constraint on google_id prevented direct user registration
- Created authentication-migration-checklist.md to track the full migration process
- This change completes the "Update User model to support multiple providers and password hash" task from the checklist

**Why It Matters:**

- Enables dual authentication system (Google OAuth and email/password)
- Provides more flexibility in how users can register and login
- Maintains backward compatibility with existing Google OAuth users
- The migration checklist provides a structured approach to implementing the full authentication overhaul

**Next Steps:**

- Continue following the authentication migration checklist, focusing on:
  1. Implement secure password hashing (bcrypt) for email/password
  2. Complete the registration endpoint for email/password
  3. Add login endpoint for email/password
  4. Implement JWT token generation and validation
- Test both authentication methods thoroughly
- Ensure proper validation on registration endpoints
- Update frontend to support both auth methods
- Track progress using the authentication migration checklist

---

### 2025-04-30: Standardizing on JWT-Only Authentication

**What Happened**:

- Made decisive shift to JWT-only authentication for all providers
- Eliminated mixed session/JWT authentication approach
- Simplified authentication flow by:
  - Using JWT for Google OAuth (converting OAuth success to JWT)
  - Using JWT for email/password authentication
  - Planning same approach for future Apple Sign-In
- Removed all session-based authentication code
- Updated frontend to handle JWT consistently across all auth methods

**Why It Matters**:

- Simplifies authentication system significantly
- Provides consistent auth experience across all platforms
- Eliminates browser-specific session issues
- Makes mobile implementation straightforward
- Reduces complexity in maintenance and debugging
- Provides clear path for future Apple Sign-In integration

**Next Steps**:

1. Complete implementation of JWT-based Google OAuth flow
2. Finish email/password authentication with JWT
3. Test thoroughly across different browsers
4. Document the simplified authentication architecture
5. Plan Apple Sign-In implementation using same JWT approach
6. Update mobile development plan to leverage JWT authentication

**Supersedes**:

- Previous mixed session/JWT authentication approach
- All session-based authentication code and documentation

### 2024-05-02: JWT-Only Authentication Fully Implemented and Standardized

**What Happened:**

- Completed migration to JWT-only authentication for all protected routes (workouts, exercises, exports, etc.).
- Removed all legacy session-based authentication and the isAuthenticated middleware from the backend.
- Standardized on a single JWT validation middleware (validateJWT) for all protected routes.
- Updated all controllers to use req.jwtUser for user identification and authorization.
- Ensured consistent authentication logic across the codebase, eliminating mixed or legacy auth logic.
- Confirmed that all frontend and backend flows now use JWT for authentication and authorization.

**Why It Matters:**

- Provides a consistent, stateless, and scalable authentication system suitable for web, mobile, and future voice input.
- Eliminates confusion and bugs caused by mixed session/JWT logic.
- Simplifies maintenance, debugging, and future feature development (e.g., Apple Sign-In, mobile sync).
- Lays a robust foundation for future enhancements like refresh token rotation, device management, and 2FA.

**Next Steps:**

- Implement refresh token rotation and revocation endpoints.
- Store refresh tokens in the database, associated with user/device for enhanced security.
- Add automated tests for all authentication flows (registration, login, refresh, logout).
- Continue following the authentication migration checklist for remaining tasks.
- Plan for future enhancements (CSRF, 2FA, etc.) after mobile app implementation.

### 2025-05-06: DB-Backed Refresh Tokens and Auth Migration Finalization

**What Happened:**

- Implemented secure, database-backed refresh token logic for all authentication flows (email/password and Google OAuth).
- Updated Google OAuth callback to generate a random refresh token, store its hash in the DB, and return the raw token to the client (not a JWT).
- Updated login and registration flows to use the same DB-backed refresh token logic.
- Added a new Sequelize migration and config setup for the `refresh_tokens` table.
- Updated project structure to include `server/config/` (for CLI config) and `server/migrations/` (for migration files).
- Ensured all tokens are revocable and support multi-device/session management.

**Why It Matters:**

- Provides secure, revocable refresh tokens for all users, improving security and session management.
- Unifies authentication logic across providers (Google, email/password).
- Lays the foundation for future features like device management and session revocation.
- Ensures compatibility and reliability across browsers (Chrome, Firefox).

**Next Steps:**

- Add automated tests for refresh token rotation and revocation.
- Monitor for issues in production and gather user feedback.
- Plan for Apple Sign-In and mobile app integration using the same approach.

### 2025-05-06: Production Database Cleanup and Schema Finalization

**What Happened:**

- Audited and cleaned up the production Railway Postgres database to remove legacy session tables (`session`, `user_sessions`).
- Verified and ensured the presence of the new `refresh_tokens` table in production, matching the DB-backed JWT refresh token system used in development.
- Confirmed that all authentication flows (email/password, Google OAuth) are now using the new DB schema in production.
- Updated local and production environments to be consistent, with no legacy session artifacts remaining.

**Why It Matters:**

- Removes confusion and potential security risks from unused legacy tables.
- Ensures production is using the latest, secure authentication system with revocable, DB-backed refresh tokens.
- Reduces maintenance overhead and risk of bugs from schema drift between environments.

**Next Steps:**

- Continue monitoring production for authentication issues or edge cases.
- Add automated tests for refresh token flows and DB cleanup.
- Prepare for future enhancements (Apple Sign-In, mobile, device/session management).

### 2025-05-07: Manual Production Database Schema Update for Auth Migration

**What Happened:**

- Manually updated the production `users` table schema via psql to support the new authentication system.
- Added the `password_hash` column to the `users` table to enable email/password authentication.
- Altered the `google_id` column to be nullable (removed NOT NULL constraint) to support multiple authentication methods.
- Verified the schema update using `\d+ users` in psql.

**Why It Matters:**

- The backend expects these schema changes for both Google OAuth and email/password authentication to work.
- Without these changes, Google OAuth login failed in production due to missing columns.
- Manual schema updates ensured no user data was lost and enabled the new unified authentication logic.

**Next Steps:**

- Resolve the frontend OAuth callback error (404 on `/auth/callback`) so that users can complete login after successful authentication.
- Ensure frontend and backend callback URLs and routes are fully aligned in all environments.
- Continue monitoring for further integration issues and document any additional manual interventions.

### 2025-05-07: Google OAuth Production Login Issue Resolved

**What Happened:**

- After updating the production database schema, Google OAuth login still resulted in a 404 error on the `/auth/callback` route in production.
- Investigation revealed that the frontend route was initially misconfigured (`/auth-callback` instead of `/auth/callback`), and Vercel was not rewriting all routes to `index.html` for client-side routing.
- Updated the frontend route to `/auth/callback` in `AppRoutes.tsx` to match the backend redirect.
- Added a `vercel.json` file to the client directory to rewrite all routes to `/`, enabling React Router to handle client-side navigation.
- Redeployed the frontend to Vercel.

**Why It Matters:**

- Ensures that OAuth callback URLs are handled correctly in production, allowing users to complete authentication and access the app.
- Aligns frontend and backend routing, preventing 404 errors on deep links and OAuth redirects.
- Demonstrates the importance of deployment configuration for single-page applications.

**Outcome:**

- Google OAuth login now works end-to-end in production.
- Users are redirected to `/auth/callback`, tokens are processed, and the user is logged in successfully.

**Next Steps:**

- Monitor for any further authentication or routing issues in production.
- Continue to test other authentication flows (email/password, logout, token refresh).
- Document any additional deployment or integration learnings as they arise.

### 2025-05-07: Frontend Authentication UI Improvements

**What Happened:**

- Renamed the landing page from `/landing` to `/home` to follow common web conventions and improve user experience.
- Created a new sign-up page (`/signup`) that matches the design of the existing login page.
- Implemented consistent styling across authentication buttons:
  - Added border styling to primary buttons to match secondary buttons
  - Standardized button widths and alignment
  - Ensured consistent spacing and padding
- Created a shared `useAuthHandlers` hook to:
  - Centralize Google and Apple authentication logic
  - Provide consistent error handling and loading states
  - Enable direct authentication from the home page
  - Reduce code duplication across Login, SignUp, and Home components
- Updated all authentication-related links to point to the correct routes
- Maintained dark mode support across all authentication pages

**Why It Matters:**

- Improves user experience by following established web conventions
- Provides a more cohesive and professional look across authentication flows
- Ensures consistent styling and behavior across all authentication options
- Makes the authentication process more intuitive for users
- Maintains accessibility and responsiveness across all screen sizes
- Reduces code duplication and improves maintainability
- Ensures consistent error handling and loading states across all auth flows

**Next Steps:**

- Monitor user feedback on the new sign-up flow
- Consider adding password strength indicators
- Plan for Apple Sign-In button styling consistency
- Consider adding loading states for social authentication buttons
- Document any additional UI/UX improvements needed
- Consider extracting email/password authentication logic to the shared hook
