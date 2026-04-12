# Sprint 3 Report - CircleUp

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
