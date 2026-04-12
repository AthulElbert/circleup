# Sprint 3 Report - CircleUp

## Sprint Goal

Deliver a working realtime collaboration layer for CircleUp where multiple users can join the same room and interact through:
- live room presence
- realtime room chat
- microphone and camera state updates
- WebRTC signaling for peer connection setup
- LAN-friendly multi-laptop testing support
- stronger frontend and backend automated test coverage

Sprint window: 2 weeks
Team: Balaji, Ramcharan, Athul, Sona

## Team Ownership

### Balaji
- Built the live room frontend experience
- Added live-room navigation from rooms and room details
- Implemented room-level realtime UI including participant list and chat layout
- Added clearer live room state messaging and reconnect UX

### Ramcharan
- Added frontend helper logic for live room state and WebRTC support
- Added device selection support for microphone and camera
- Added STUN/TURN configuration support in frontend
- Added frontend unit tests and Cypress coverage for Sprint 3 flows

### Athul
- Implemented backend websocket handler support for realtime rooms
- Added signaling validation and relay behavior for WebRTC messages
- Added backend realtime handler tests
- Verified backend API behavior used by the Sprint 3 frontend

### Sona
- Implemented backend room hub behavior for presence, chat, media updates, and signaling relay
- Added backend realtime hub tests
- Added backend config/runtime support for LAN and cross-device testing
- Updated backend documentation for Sprint 3 realtime usage

## User Stories

- As a user, I want to enter a live room from the rooms list so I can participate in realtime discussions.
- As a user, I want to see who is currently present in a room.
- As a user, I want to send and receive room chat messages in real time.
- As a user, I want to toggle my microphone and camera and have that state reflected in the room.
- As a user, I want my browser to negotiate a WebRTC connection with other participants.
- As a user, I want the room to recover gracefully if the realtime connection drops.
- As a user, I want to select different media devices if needed.
- As a developer, I want STUN/TURN configuration support so realtime connectivity is more reliable.
- As a developer, I want frontend and backend tests for the Sprint 3 realtime layer.
- As a developer, I want updated backend API documentation for the websocket-based realtime functionality.

## Planned Issues (with Owner)

- FE-1 (Balaji): Add live room page and route integration.
- FE-2 (Balaji): Add participant presence UI and chat panel.
- FE-3 (Balaji): Add live-room entry actions from rooms list and room details.
- FE-4 (Balaji): Add reconnect messaging and clearer call-state UI.

- FE-5 (Ramcharan): Add live-room helper/state logic for connection and participant behavior.
- FE-6 (Ramcharan): Add device selection for microphone and camera.
- FE-7 (Ramcharan): Add STUN/TURN config support in frontend.
- FE-8 (Ramcharan): Add frontend unit tests for live-room and WebRTC helpers.
- FE-9 (Ramcharan): Add Cypress coverage for live-room entry and chat.

- BE-1 (Athul): Add websocket room handler for Sprint 3 realtime flow.
- BE-2 (Athul): Add WebRTC signaling relay support for offer, answer, and ICE.
- BE-3 (Athul): Add backend tests for realtime auth, room validation, and signaling rules.

- BE-4 (Sona): Add realtime room hub for participant management and chat broadcast.
- BE-5 (Sona): Add backend tests for room hub join, leave, media updates, and signal targeting.
- BE-6 (Sona): Add LAN-friendly backend config/runtime support for multi-laptop testing.

- TEAM-1 (Entire Team): Integrate frontend live-room UI with backend websocket room endpoint.
- TEAM-2 (Entire Team): Update backend API documentation for Sprint 3 realtime functionality.

## Completion Status

### Completed

- FE-1, FE-2, FE-3, FE-4
  - Result: Sprint 3 live-room UI, room entry, and reconnect/call-state experience are implemented and demo-ready.

- FE-5, FE-6, FE-7, FE-8, FE-9
  - Result: Frontend helper logic, device/STUN-TURN support, and automated frontend coverage are in place.

- BE-1, BE-2, BE-3, BE-4, BE-5, BE-6
  - Result: Backend websocket realtime infrastructure and backend test coverage support the Sprint 3 live-room flow.

- TEAM-1, TEAM-2
  - Result: Frontend and backend are integrated for Sprint 3 realtime behavior, and the backend API documentation is updated in this report.

## Detail Work Completed in Sprint 3

Sprint 3 focused on turning CircleUp from a room-management application into a working realtime collaboration experience.

### Frontend work completed

- Added a live room screen at `frontend/src/pages/RoomLive.jsx`.
- Added a route for live rooms at `/rooms/:roomId/live`.
- Added live-room entry points from the rooms list and room details pages.
- Added realtime participant presence UI.
- Added realtime room chat UI.
- Added microphone and camera toggle controls.
- Added local media preview.
- Added remote participant media tiles.
- Added connection state messaging for:
  - connecting
  - waiting for another participant
  - negotiating media connection
  - live call active
  - reconnecting
  - disconnected
- Added reconnect handling when the websocket connection drops.
- Added device selection for microphone and camera.
- Added STUN/TURN configuration support through frontend environment variables.
- Added ICE-candidate queueing and flush logic to make WebRTC signaling more reliable.
- Added LAN-friendly frontend configuration through `VITE_API_BASE_URL` and `VITE_WS_BASE_URL`.

### Backend work completed

- Added websocket realtime room support on the backend.
- Added a room hub to manage:
  - connected participants
  - chat messages
  - media state updates
  - signaling messages
- Added participant join/leave presence broadcasts.
- Added chat broadcast across room participants.
- Added media state broadcast across room participants.
- Added WebRTC signaling relay for:
  - offer
  - answer
  - ice
- Hardened signaling to reject unsupported signal kinds.
- Prevented invalid self-targeted signaling.
- Made CORS/origin behavior configurable through backend config.
- Added LAN-friendly backend startup support using `API_ADDR` and `ALLOWED_ORIGINS`.

### Integration work completed

- Integrated frontend live-room UI with backend websocket room endpoint.
- Integrated WebRTC signaling on top of the websocket room hub.
- Verified multi-user room behavior for:
  - shared presence
  - live chat
  - signaling exchange
  - media state updates
- Updated project documentation for LAN and STUN/TURN-based testing.

## Evidence of Completion

### Frontend
- Users can navigate from rooms into a live room screen.
- Live room screen shows participant list, chat, local preview, and remote participant tiles.
- Live room shows call-state messaging and reconnect feedback.
- Microphone and camera state toggles are exposed in the UI.
- Device selection is exposed in the UI for microphone and camera.
- Frontend unit tests and Cypress tests cover Sprint 3 live-room behavior.

### Backend
- Backend exposes a realtime websocket endpoint at `GET /ws/rooms/{roomID}?token=<jwt>`.
- Backend relays room presence, chat, media-state updates, and signaling messages.
- Backend validates room existence and JWT authentication before joining the realtime room.
- Backend unit tests cover realtime room hub logic and realtime handler validation logic.

## Frontend Unit Tests

### Existing frontend unit tests

- `frontend/src/lib/validators.test.js`
  - Tests validation helpers.
- `frontend/src/store/authSlice.test.js`
  - Tests auth token and current-user state handling.
- `frontend/src/components/TopicForm.test.jsx`
  - Tests topic form submission behavior.
- `frontend/src/components/AuthGate.test.jsx`
  - Tests protected route gating behavior.

### Sprint 3 frontend unit tests added

- `frontend/src/lib/liveRoom.test.js`
  - Tests live-room helper functions.
  - Covers connection tone mapping.
  - Covers call-state derivation.
  - Covers participant join/leave merge logic.

- `frontend/src/lib/webrtc.test.js`
  - Tests WebRTC helper functions.
  - Covers STUN/TURN config parsing.
  - Covers media device enumeration.
  - Covers ICE-candidate queueing.
  - Covers ICE-candidate flush behavior.
  - Covers peer track replacement logic.

### Frontend Cypress tests

- `frontend/cypress/e2e/login-page.cy.js`
  - Smoke test for login page interaction.

- `frontend/cypress/e2e/live-room-entry.cy.js`
  - Tests entry into the live-room screen from the rooms flow.
  - Verifies route navigation and live-room rendering.

- `frontend/cypress/e2e/live-room-chat.cy.js`
  - Tests sending a chat message from the live-room UI.
  - Verifies that the sent message appears in the chat panel.

## Backend Unit Tests

### Existing backend unit tests

- `backend/internal/handlers/auth_test.go`
  - Tests OTP request and verification flow.
- `backend/internal/handlers/invites_test.go`
  - Tests invite generation and invite join behavior.
- `backend/internal/handlers/topics_rooms_test.go`
  - Tests topics and rooms handlers.
- `backend/internal/store/store_test.go`
  - Tests in-memory store behavior for topics, rooms, and invite persistence.

### Sprint 3 backend unit tests added

- `backend/internal/realtime/hub_test.go`
  - Tests realtime room hub behavior.
  - Covers:
    - participant join
    - participant leave
    - chat broadcast
    - media updates
    - targeted signaling relay

- `backend/internal/handlers/realtime_test.go`
  - Tests realtime websocket handler support logic.
  - Covers:
    - token parsing for realtime auth
    - room existence validation
    - unauthorized websocket access rejection
    - allowed signaling kind validation

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
- Supports room presence, room chat, media-state updates, and WebRTC signaling.

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

## Planned But Not Completed

- HTTPS-based local dev hosting for trusted camera/microphone access across LAN devices.
  - Why: Sprint 3 validated signaling, presence, and chat on LAN, but secure-origin media hosting still needs additional setup.

- Frontend unit tests are not at a 1:1 ratio with every live-room function and component.
  - Why: Sprint effort focused on critical live-room helper logic and realtime path coverage.

- Backend unit tests are not at a 1:1 ratio with every realtime helper and handler branch.
  - Why: Sprint effort prioritized the core signaling, room validation, and hub behavior paths.

- Cypress coverage does not yet include a full two-user live media workflow.
  - Why: Cypress coverage stayed focused on deterministic UI-level realtime entry and chat flows.

## Branch/Folders Delivered In Sprint 3

- `circleup/balajiSprint3`
- `circleup/ramSprint3`
- `circleup/athulSprint3`
- `circleup/sonaSprint3`
- `circleup/main` (merged, runnable snapshot)

## Demo Readiness Checklist

- Frontend and backend run together for Sprint 3 realtime behavior.
- Live room route is accessible from rooms and room details.
- Realtime participant presence is visible.
- Realtime room chat is visible.
- WebRTC signaling route is integrated through the websocket room endpoint.
- Backend tests pass with `go test ./...`.
- Frontend unit tests pass with `npm test`.
- Cypress tests pass with `npm run cypress:run`.
