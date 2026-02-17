# Sprint 1 Report - CircleUp

## Sprint Goal

Deliver a working authentication baseline for CircleUp with:
- frontend auth experience (signup, OTP verify, login)
- backend auth APIs (request OTP, verify OTP, login)
- JWT-protected route for access control
- demo-ready command-line test flow

Sprint window: 2 weeks
Team: Balaji, Ramcharan, Athul, Sona 

## Team Ownership

### Balaji
- Frontend app scaffold (Vite, React Router, Tailwind)
- Core app layout and navigation shell
- Page containers: Home, Login, Signup, OTP Verify
- UI polish pass for auth screens and landing section

### Ramcharan
- Redux auth store and token state slice
- AuthGate/protected-route helper
- Shared auth form components (LoginForm, SignupForm, OtpVerifyForm)
- Input validation utilities and API helper scaffold

### Sona
- Backend project scaffold and server bootstrap
- Config loading and route composition
- Health endpoint
- Migration baseline (users, otp_tokens)
- Integration wiring between app server and auth routes

### Athul
- Auth handlers: request OTP, verify OTP, login
- JWT middleware for protected endpoints
- In-memory store and auth domain models
- Auth unit test coverage for OTP flow
- DEV_OTP support for local CLI testing

## User Stories

- As a new user, I want to request an OTP so I can begin signup.
- As a new user, I want to verify OTP and set a password so my account becomes active.
- As a returning user, I want to log in using email/password and receive a JWT.
- As an authenticated user, I want protected routes to reject missing/invalid tokens.
- As a user, I want a clear auth UI flow so onboarding is straightforward.
- As a developer, I want CLI-testable APIs so sprint demos are reproducible.

## Planned Issues (with Owner)

- FE-1 (Balaji): Initialize frontend scaffold and routing.
- FE-2 (Balaji): Build auth page containers and navigation shell.
- FE-3 (Ramcharan): Implement Redux auth state and token handling.
- FE-4 (Ramcharan): Build reusable auth forms with validation.
- FE-5 (Ramcharan): Implement protected route guard.
- FE-6 (Balaji): Improve visual quality of auth pages for demo.

- BE-1 (Sona): Initialize backend scaffold and startup pipeline.
- BE-2 (Sona): Add health endpoint and core route wiring.
- BE-3 (Athul): Implement request-otp endpoint and verify-otp endpoint and user creation.
- BE-4 (Athul): Implement login endpoint with JWT issuance.
- BE-5 (Athul): Implement JWT middleware and protected route validation.
- BE-6 (Sona): Add migration baseline for users/otp_tokens.
- BE-7 (Athul): Add auth flow tests.

## Completion Status

### Completed

- FE-1, FE-2, FE-3, FE-4, FE-5, FE-6
  - Result: Frontend auth flow is runnable and demo-ready.

- BE-1, BE-2, BE-3, BE-4, BE-5, BE-6, BE-7
  - Result: Backend auth flow is runnable from CLI end-to-end.

## Evidence of Completion

### Frontend
- Auth pages are connected through shared components and Redux state.
- Protected route behavior is implemented using AuthGate.

### Backend
- Endpoints implemented:
  - `POST /auth/request-otp`
  - `POST /auth/verify-otp`
  - `POST /auth/login`
  - `GET /protected` (JWT required)
  - `GET /health`
- CLI flow validated:
  - request OTP -> verify OTP -> login -> protected route access
- Unit tests exist for auth flow.

## Planned But Not Completed

- Production-grade persistent auth storage (real DB integration in runtime path)
  - Why: Sprint 1 intentionally used in-memory storage to reduce setup overhead and hit demo goals.

- Full standardized API error contract and advanced validation matrix
  - Why: deferred to maintain focus on core path and delivery cadence.

- Broader test suite (integration/negative/security edge cases)
  - Why: Sprint capacity prioritized shipping the happy-path auth baseline.

- CI hardening across frontend/backend pipelines
  - Why: initial implementation completed, but full hardening was deprioritized for feature completion.

## Branch/Folders Delivered In Sprint 1

- `circleup/balaji-frontend-setup` 
- `circleup/RamSprint1` 
- `circleup/sonamariajose` 
- `circleup/athulSprint1` 
- `circleup/main` (merged, runnable snapshot)

## Demo Readiness Checklist

- Backend starts with `DEV_OTP=true` for CLI demos.
- OTP verify and login flow is executable from terminal.
- JWT-protected endpoint behavior is visible with and without token.
- Frontend displays complete Sprint 1 auth flow and routing.
