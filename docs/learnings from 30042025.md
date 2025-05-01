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

---

## How to Use This Document (reminder)

1. **Add a New Entry**  
   Whenever a milestone is reached or a significant change is made, create a new heading (e.g., `### [YYYY-MM-DD]: Heading Text`) to detail:

   - What was changed or learned.

2. **Keep It Concise**  
   Focus on bullet points and short explanations so the document remains easy to read and update.

3. **Document Decisions**  
   If a design or architectural choice is made, record the reasoning. This will help future contributors understand the project's evolution.

4. **Reflect Often**  
   Look back on previous entries to avoid repeating mistakes and to see how the project has progressed over time.
