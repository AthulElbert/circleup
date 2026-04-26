# Sprint 4 Report - CircleUp

## Sprint Goal

Deliver the final MVP hardening pass for CircleUp by improving product usability, runtime reliability, moderation controls, persistence, HTTPS/TURN-ready development setup, and automated coverage.

Sprint window: 2 weeks
Team: Balaji, Ramcharan, Athul, Sona

## Team Ownership

### Balaji
- Improved the landing page and auth entry experience
- Added dedicated navigation for Login, Sign up, and Verify OTP
- Polished the live-room screen layout for small screens
- Improved responsive live-room usability and control layout

### Ramcharan
- Added frontend HTTPS/TURN-ready development support
- Expanded frontend helper logic and tests for live-room behavior
- Added new frontend component unit tests
- Expanded Cypress coverage across auth, rooms, moderation, and live-room flows

### Athul
- Refactored backend runtime persistence from in-memory-only to SQLite-backed storage
- Updated backend startup/config to support the new persistent store
- Added backend persistence validation through store tests
- Verified backend build/runtime wiring for the final MVP path

### Sona
- Expanded backend moderation and role behavior for host/co-host/participant states
- Added backend realtime moderation tests and role validation coverage
- Updated backend and project documentation for final run/test flows
- Verified backend API completeness for the final presentation-ready project

## User Stories

- As a new user, I want a clear landing page with visible auth entry points so I do not need to manually type routes.
- As a user, I want my data such as users, topics, rooms, and invites to persist across backend restarts.
- As a host, I want to mute, unmute, remove, promote, and demote participants so I can manage the room safely.
- As a co-host, I want limited moderation powers over participants.
- As a participant, I want the live-room UI to remain usable on smaller screens.
- As a developer, I want local HTTPS/TURN-ready setup for more reliable media testing.
- As a developer, I want stronger automated test coverage for frontend and backend behavior.
- As a team, we want a final README that clearly explains how to run, test, and demo the application.

## Planned Issues (with Owner)

- FE-1 (Balaji): Improve the home page and signed-out navigation flow.
- FE-2 (Balaji): Add dedicated Sign up and Verify OTP entry points in the UI.
- FE-3 (Balaji): Improve live-room responsive layout for smaller screens.
- FE-4 (Balaji): Make live-room panels and controls more usable on mobile-sized layouts.

- FE-5 (Ramcharan): Add frontend HTTPS dev support.
- FE-6 (Ramcharan): Add TURN/STUN-ready frontend configuration and documentation.
- FE-7 (Ramcharan): Add new frontend unit tests for layout and room list behavior.
- FE-8 (Ramcharan): Expand Cypress coverage for auth and room management flows.

- BE-1 (Athul): Replace runtime in-memory-only persistence with a SQLite-backed store.
- BE-2 (Athul): Refactor backend wiring from concrete in-memory store usage to store interface usage.
- BE-3 (Athul): Validate backend persistence through updated store tests.

- BE-4 (Sona): Complete moderation role model for host, co-host, and participant.
- BE-5 (Sona): Add backend moderation and role-validation test coverage.
- BE-6 (Sona): Update final backend/project run documentation and test documentation.

- TEAM-1 (Entire Team): Expand frontend and backend automated coverage for final MVP verification.
- TEAM-2 (Entire Team): Finalize front-page README with run, use, multi-laptop, and troubleshooting instructions.

## Completion Status

### Completed

- FE-1, FE-2, FE-3, FE-4
  - Result: The application now has a stronger landing page, explicit auth navigation, and a more usable live-room experience on smaller screens.

- FE-5, FE-6, FE-7, FE-8
  - Result: Frontend dev setup now supports HTTPS/TURN-ready configuration, and frontend automated coverage was expanded.

- BE-1, BE-2, BE-3
  - Result: Backend runtime persistence is now SQLite-backed, and backend wiring supports the persistent store path.

- BE-4, BE-5, BE-6
  - Result: Moderation roles were expanded and validated, and backend/project documentation was updated for final usage.

- TEAM-1, TEAM-2
  - Result: Final test coverage and top-level documentation are in place for running, testing, and presenting the completed project.

## Detail Work Completed in Sprint 4

Sprint 4 focused on converting CircleUp from a sprint-by-sprint prototype into a final, demo-ready MVP with stronger runtime behavior, clearer onboarding, broader test coverage, and improved usability.

### Frontend work completed

- Improved the landing page content and structure.
- Added dedicated signed-out navigation for:
  - Login
  - Sign up
  - Verify OTP
  - Get started
- Improved the auth page presentation for login, signup, and OTP verification.
- Improved live-room responsive layout for smaller screens.
- Added mobile-friendly participant/chat panel switching in the live-room screen.
- Improved live-room control sizing and spacing for touch-friendly use.
- Kept role-aware moderation controls visible within the participant list.
- Added frontend HTTPS dev support through Vite configuration.
- Added environment-driven TURN/STUN configuration support in frontend documentation and setup.
- Added frontend unit tests for:
  - layout behavior
  - room list behavior
- Expanded Cypress coverage for:
  - auth flow
  - room management flow
  - existing live-room entry/chat/moderation flows

### Backend work completed

- Replaced runtime in-memory-only persistence with SQLite-backed persistence.
- Added backend DB bootstrap and schema initialization support.
- Refactored backend store usage to work through a store interface instead of concrete runtime-only storage.
- Updated backend startup wiring to initialize the SQLite store.
- Preserved in-memory store support for lightweight test scenarios.
- Expanded room moderation model to support:
  - host
  - co-host
  - participant
- Added backend moderation actions and restrictions for:
  - mute
  - unmute
  - remove
  - promote
  - demote
- Expanded backend realtime validation coverage around moderation and role updates.

### Integration work completed

- Preserved integration between frontend and backend after moving backend runtime persistence to SQLite.
- Preserved integration between live-room UI and backend moderation logic after role model expansion.
- Updated front-page README to explain:
  - requirements
  - installation
  - environment variables
  - run commands
  - usage flow
  - LAN testing
  - troubleshooting
  - test commands

## Evidence of Completion

### Frontend
- Signed-out users can now navigate directly to Login, Sign up, and Verify OTP from the home/header UI.
- Live-room layout behaves more cleanly on smaller screens through mobile-oriented panel switching.
- Frontend supports HTTPS dev configuration and TURN/STUN environment variables.
- Frontend unit tests and Cypress tests now cover more of the final MVP flow.

### Backend
- Runtime data persists through SQLite rather than resetting on every backend restart.
- Backend moderation behavior supports host/co-host/participant roles.
- Backend tests cover persistence and moderation/role behavior.
- Backend API remains integrated with the final frontend flows.

## Frontend Unit Tests

### Existing frontend unit tests

- `frontend/src/lib/validators.test.js`
  - Tests validation helpers.
- `frontend/src/store/authSlice.test.js`
  - Tests auth token and current-user state behavior.
- `frontend/src/components/TopicForm.test.jsx`
  - Tests topic form submission behavior.
- `frontend/src/components/AuthGate.test.jsx`
  - Tests protected route gating.
- `frontend/src/lib/liveRoom.test.js`
  - Tests live-room helper logic.
- `frontend/src/lib/webrtc.test.js`
  - Tests WebRTC helper/config behavior.

### Sprint 4 frontend unit tests added

- `frontend/src/components/Layout.test.jsx`
  - Tests signed-out header/auth entry links.
  - Tests signed-in identity and logout rendering.

- `frontend/src/components/RoomList.test.jsx`
  - Tests empty-state rendering.
  - Tests room actions and invite-generation rendering behavior.

## Frontend Cypress Tests

### Existing Cypress coverage retained

- `frontend/cypress/e2e/login-page.cy.js`
  - Smoke test for login form interaction.
- `frontend/cypress/e2e/live-room-entry.cy.js`
  - Tests opening the live-room screen.
- `frontend/cypress/e2e/live-room-chat.cy.js`
  - Tests room chat interaction.
- `frontend/cypress/e2e/live-room-moderation.cy.js`
  - Tests moderation UI flow.
- `frontend/cypress/e2e/live-room-muted.cy.js`
  - Tests muted-user behavior.

### Sprint 4 Cypress tests added

- `frontend/cypress/e2e/auth-flow.cy.js`
  - Tests signup OTP request, OTP verification, and login flow.

- `frontend/cypress/e2e/room-management.cy.js`
  - Tests topic creation, room creation, invite generation, room details, and invite-based join flow.

## Backend Unit Tests

### Existing backend unit tests

- `backend/internal/handlers/auth_test.go`
  - Tests OTP/auth flow behavior.
- `backend/internal/handlers/invites_test.go`
  - Tests invite generation and invite join behavior.
- `backend/internal/handlers/topics_rooms_test.go`
  - Tests topics and rooms handlers.
- `backend/internal/realtime/hub_test.go`
  - Tests realtime hub behavior including join, leave, signaling, and moderation paths.
- `backend/internal/handlers/realtime_test.go`
  - Tests realtime handler auth and signaling validation.

### Sprint 4 backend unit tests added or expanded

- `backend/internal/store/store_test.go`
  - Expanded to validate both in-memory and SQLite-backed store behavior.
  - Covers topic creation, room creation, retrieval, and room update persistence.

- `backend/internal/realtime/hub_test.go`
  - Expanded to cover:
    - invalid role rejection
    - moderation restriction behavior
    - role promotion behavior
    - chat retention cap behavior

- `backend/internal/handlers/realtime_test.go`
  - Expanded to cover token parsing rejection when the JWT subject is missing.

## Updated Backend API Documentation

### Health

#### `GET /health`

Purpose:
- Confirms that the backend server is running.

Response:
- `200 OK`
- body: `ok`

### Authentication API

#### `POST /auth/request-otp`

Purpose:
- Starts the signup flow by generating an OTP for an email address.

Request body:
```json
{ "email": "test@circleup.com" }
```

Response:
- `200 OK`
- In local demo mode with `DEV_OTP=true`, the OTP is also returned.

Example response:
```json
{ "message": "otp sent", "otp": "123456" }
```

#### `POST /auth/verify-otp`

Purpose:
- Verifies OTP and activates the account.

Request body:
```json
{
  "email": "test@circleup.com",
  "otp": "123456",
  "password": "pass123"
}
```

Response:
- `200 OK`

Example response:
```json
{ "message": "verified" }
```

#### `POST /auth/login`

Purpose:
- Authenticates a user and returns a JWT.

Request body:
```json
{
  "email": "test@circleup.com",
  "password": "pass123"
}
```

Response:
- `200 OK`

Example response:
```json
{ "token": "<jwt-token>" }
```

### Protected API

#### `GET /protected`

Purpose:
- Confirms JWT-protected backend access.

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`
- body: `ok`

### Topics API

#### `POST /topics/`

Purpose:
- Creates a new topic.

Headers:
```text
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request body:
```json
{ "name": "WebRTC" }
```

Response:
- `201 Created`

#### `GET /topics/`

Purpose:
- Lists all available topics.

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`

### Rooms API

#### `POST /rooms/`

Purpose:
- Creates a room linked to a topic.

Headers:
```text
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request body:
```json
{
  "title": "Realtime Circle",
  "topicId": "topic_001",
  "visibility": "public"
}
```

Response:
- `201 Created`

#### `GET /rooms/`

Purpose:
- Lists rooms available to the authenticated user.

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`

#### `GET /rooms/{roomID}`

Purpose:
- Returns a specific room by id.

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK` if found
- `404 Not Found` if missing

### Invites API

#### `POST /invites/generate`

Purpose:
- Generates an invite code for a private room.

Headers:
```text
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request body:
```json
{ "roomId": "room_002" }
```

Response:
- `201 Created`

Example response:
```json
{ "code": "INV-ABC123", "roomId": "room_002" }
```

#### `POST /invites/join`

Purpose:
- Joins a room using an invite code.

Headers:
```text
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request body:
```json
{ "code": "INV-ABC123" }
```

Response:
- `200 OK`
- returns the joined room object

### Realtime API

#### `GET /ws/rooms/{roomID}?token=<jwt>`

Purpose:
- Opens the websocket connection for a live room.
- Supports room presence, room chat, media-state updates, WebRTC signaling, and moderation events.

Authentication:
- JWT is passed as a `token` query parameter.

Behavior:
- validates that the room exists
- validates the JWT token
- joins the participant to the room hub
- returns an initial room snapshot
- relays realtime events to other room participants

Supported inbound message types:
- `chat`
- `media`
- `signal`
- `moderation`

#### Realtime message: `chat`

Purpose:
- Broadcasts a chat message to the room.

Example payload:
```json
{
  "type": "chat",
  "body": "Hello everyone"
}
```

#### Realtime message: `media`

Purpose:
- Broadcasts microphone/camera state changes.

Example payload:
```json
{
  "type": "media",
  "micOn": true,
  "camOn": false
}
```

#### Realtime message: `signal`

Purpose:
- Relays WebRTC signaling messages to a target participant.

Supported signal kinds:
- `offer`
- `answer`
- `ice`

Example payload:
```json
{
  "type": "signal",
  "toEmail": "peer@circleup.com",
  "kind": "offer",
  "payload": { "type": "offer", "sdp": "..." }
}
```

#### Realtime message: `moderation`

Purpose:
- Applies a role-aware moderation action within the room.

Supported actions:
- `mute`
- `unmute`
- `kick`
- `promote`
- `demote`

Example payload:
```json
{
  "type": "moderation",
  "action": "mute",
  "toEmail": "guest@circleup.com"
}
```


## Demo Readiness Checklist

- Home page and signed-out navigation are presentation-ready.
- Signup, verify, and login flows are visible in the UI.
- Topics, rooms, invite generation, room details, and invite-join flows are working.
- Live-room UI is responsive and moderation-aware.
- Host/co-host/participant role model is reflected in backend and frontend behavior.
- Backend runtime persistence works through SQLite.
- Backend tests pass with `go test ./...`.
- Frontend unit tests pass with `npm test`.
- Frontend build passes with `npm run build`.
- Cypress tests cover auth, rooms, and live-room behavior.
