# Authentication Migration Checklist

_This checklist tracks the migration to JWT-based authentication for POWR, supporting Google OAuth, Email/Password, and future Apple Sign-In. Use the checkboxes to track progress and add notes as you go._

---

## 1. Design & Planning

- [x] **Update authentication flow diagrams**  
       _Notes: Simplified to JWT-only flow for all providers_
- [x] **Update API documentation for new endpoints and flows**  
       _Notes: Updated PRD to reflect JWT-only approach_
- [x] **Update User model to support multiple providers and password hash**  
       _Notes: Modified schema to make google_id nullable, added password_hash_
- [ ] **Design RefreshToken (or Session) table for refresh tokens**  
       _Notes: Will be implemented after core JWT flow is stable_

---

## 2. Backend Implementation

- [x] **Implement secure password hashing (bcrypt) for email/password**  
       _Notes: Implemented in authController.ts_
- [x] **Add registration endpoint for email/password**  
       _Notes: Implemented with JWT issuance_
- [x] **Add login endpoint for email/password**  
       _Notes: Implemented with JWT issuance_
- [x] **Integrate Google OAuth (OAuth 2.0 flow)**  
       _Notes: Modified to issue JWT on successful OAuth_
- [ ] **Integrate Apple Sign-In (OAuth 2.0 flow)**  
       _Notes: Planned for implementation with mobile app_
- [x] **On successful OAuth, create/update user and issue tokens**  
       _Notes: Implemented for Google OAuth_
- [x] **Implement JWT access and refresh token generation**  
       _Notes: Basic JWT implementation complete_
- [x] **Add JWT validation middleware**  
       _Notes: Implemented and simplified to handle only JWT_
- [ ] **Implement refresh token rotation and revocation endpoints**  
       _Notes: To be implemented_
- [ ] **Store refresh tokens in DB, associated with user/device**  
       _Notes: To be implemented_
- [ ] **Add logout endpoint to revoke refresh tokens**  
       _Notes: Basic logout implemented, token revocation pending_

---

## 3. Frontend Implementation

- [x] **Update login UI for Google, Apple, and email/password**  
       _Notes: Implemented Google and email/password, Apple pending_
- [x] **Implement registration form for email/password**  
       _Notes: Complete with validation_
- [x] **Handle access token storage (memory/secure storage)**  
       _Notes: Using localStorage for web_
- [ ] **Handle refresh token storage (HTTP-only cookie/web, secure storage/mobile)**  
       _Notes: To be implemented_
- [ ] **Implement automatic token refresh on expiry**  
       _Notes: To be implemented_
- [x] **Show clear error messages for auth failures/expiration**  
       _Notes: Implemented with ErrorToast component_

---

## 4. Testing

- [ ] **Unit tests for registration, login, token refresh, logout**  
       _Notes: To be implemented_
- [ ] **Integration tests for OAuth flows (Google, Apple)**  
       _Notes: To be implemented_
- [ ] **Test token expiration and refresh logic**  
       _Notes: To be implemented_
- [ ] **End-to-end tests for web and mobile clients**  
       _Notes: To be implemented_

---

## 5. Migration & Rollout

- [x] **Plan and execute migration for existing Google users**  
       _Notes: No migration needed, JWT implementation preserves existing users_
- [ ] **Communicate changes to users if needed**  
       _Notes: Not needed, changes are transparent to users_
- [ ] **Deploy to staging, then production**  
       _Notes: Pending completion of core features_
- [ ] **Monitor for issues and gather feedback**  
       _Notes: To be implemented_

---

## 6. Documentation & Follow-up

- [x] **Update PRD and learnings with implementation details**  
       _Notes: Updated to reflect JWT-only approach_
- [ ] **Plan for future enhancements (CSRF, 2FA, etc.)**  
       _Notes: To be considered after mobile app implementation_

---

_Add additional notes, blockers, or questions below as needed:_

- Current focus is on stabilizing JWT implementation before adding refresh tokens
- Apple Sign-In implementation will follow same JWT pattern as Google OAuth
- Mobile implementation will use same JWT approach with secure storage
