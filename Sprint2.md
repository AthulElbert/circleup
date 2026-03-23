# Sprint 2 Report - CircleUp

## Sprint Goal

Deliver an integrated Sprint 2 build where frontend and backend work together for:
- OTP signup and verification
- JWT-based login using the real backend token
- topics creation and listing
- rooms creation, listing, and detail view
- private room invite generation and invite-based join flow
- automated frontend and backend test coverage baseline

Sprint window: 2 weeks
Team: Balaji, Ramcharan, Athul, Sona

## Team Ownership

### Balaji
- Page-level Sprint 2 UI work
- Route integration for topics, rooms, room details, and invite join
- Create Room and Join Invite page flows
- Page-level loading, empty, and success-state handling

### Ramcharan
- Shared frontend state and auth behavior
- Login integration with real backend JWT
- Header updates for authenticated user state and logout
- Room list enhancements, invite generation UX, and frontend test setup
- Frontend unit tests and Cypress smoke test

### Athul
- Backend runtime integration support for Sprint 2 flows
- Store-level validation coverage
- Support for topics, rooms, and invite persistence behavior in tests

### Sona
- Backend handler/API test coverage for Sprint 2 resources
- Verification of topic and room API behavior
- Coverage for auth and invite handler flows

## Detail Work Completed in Sprint 2

### Integration and Sprint 1 Carryover Completion

- Integrated frontend auth pages with real backend endpoints.
- Replaced mock frontend login behavior with real JWT login from the backend.
- Connected frontend protected flows to backend-issued authentication state.
- Completed authenticated header behavior showing logged-in user email and logout option.
- Resolved browser-to-backend integration issues by supporting frontend API access from the running app.

### Frontend Functionality Completed

- Added working Signup flow using `POST /auth/request-otp`.
- Added working OTP Verify flow using `POST /auth/verify-otp`.
- Added working Login flow using `POST /auth/login` and redirect after success.
- Added Topics page with topic creation and topic listing.
- Added Create Room page for public/private room creation.
- Added Rooms page with room listing and topic-name display.
- Added private-room invite generation directly in the UI.
- Added Room Details page at `/rooms/:roomId`.
- Added Join Invite page and room-join flow using invite codes.
- Added better page feedback through loading, empty, and error states.

### Backend Functionality Completed

- Verified and used auth endpoints as the frontend integration base.
- Verified topics endpoints for create and list behavior.
- Verified rooms endpoints for create, list, and get-by-id behavior.
- Verified invite endpoints for invite generation and invite join behavior.
- Added store-level and handler-level backend tests for Sprint 2 resources.

## Frontend Tests Added

### Cypress Test

- `frontend/cypress/e2e/login-page.cy.js`
  - Smoke test for the login page
  - Confirms the page loads and the user can type into login fields

### Frontend Unit Tests

- `frontend/src/lib/validators.test.js`
  - Validates form input utility behavior
- `frontend/src/store/authSlice.test.js`
  - Tests auth state updates and token/user handling
- `frontend/src/components/TopicForm.test.jsx`
  - Tests topic form rendering and submission behavior
- `frontend/src/components/AuthGate.test.jsx`
  - Tests protected-route gating behavior

## Backend Tests Added

- `backend/internal/handlers/auth_test.go`
  - Covers OTP request, OTP verify, and login flow behavior
- `backend/internal/handlers/invites_test.go`
  - Covers invite generation and invite join behavior
- `backend/internal/handlers/topics_rooms_test.go`
  - Covers topic creation/listing and room creation/get behavior
- `backend/internal/store/store_test.go`
  - Covers store-level topic creation, room persistence, and invite-code update behavior

## Backend API Documentation

### Health Endpoint

`GET /health`

Purpose:
- Confirms the backend server is running

Response:
- `200 OK`
- body: `ok`

### Authentication API

#### `POST /auth/request-otp`

Purpose:
- Starts signup by generating an OTP for an email address

Request body:
```json
{ "email": "test@circleup.com" }
```

Response:
- `200 OK`
- Returns success message
- In local demo mode with `DEV_OTP=true`, also returns the OTP

Example response:
```json
{ "message": "otp sent", "otp": "123456" }
```

#### `POST /auth/verify-otp`

Purpose:
- Verifies the OTP and creates/activates the user account

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
- Authenticates the user and returns a JWT token

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
- Example JWT-protected endpoint used to verify authenticated access

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
- Creates a new discussion topic

Headers:
```text
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request body:
```json
{ "name": "System Design" }
```

Response:
- `201 Created`

Example response:
```json
{ "id": "topic_001", "name": "System Design" }
```

#### `GET /topics/`

Purpose:
- Lists all available topics

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`

Example response:
```json
[
  { "id": "topic_001", "name": "System Design" }
]
```

### Rooms API

#### `POST /rooms/`

Purpose:
- Creates a room linked to a topic

Headers:
```text
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request body:
```json
{
  "title": "Interview Prep",
  "topicId": "topic_001",
  "visibility": "private"
}
```

Response:
- `201 Created`

Example response:
```json
{
  "id": "room_002",
  "title": "Interview Prep",
  "topicId": "topic_001",
  "visibility": "private",
  "ownerEmail": "test@circleup.com"
}
```

#### `GET /rooms/`

Purpose:
- Lists rooms available to the authenticated user

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`

#### `GET /rooms/{roomID}`

Purpose:
- Returns a specific room by id

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK` if the room exists
- `404 Not Found` if the room does not exist

### Invites API

#### `POST /invites/generate`

Purpose:
- Generates an invite code for a private room

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
- Joins a room using an invite code

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
- Returns the joined room object

## Completion Status

### Completed

- Frontend and backend integration for auth flow
- Frontend and backend integration for topics flow
- Frontend and backend integration for room creation and listing
- Frontend and backend integration for room detail retrieval
- Frontend and backend integration for private invite generation and join
- Frontend unit test baseline
- Cypress smoke test baseline
- Backend unit test baseline
- Backend API documentation for Sprint 2

## Planned But Not Completed

- Frontend unit tests are not at a 1:1 ratio with functions/components.
- Backend unit tests are not at a full 1:1 ratio with all handlers/store functions.
- Cypress coverage is limited to a simple smoke test and does not yet cover a full user journey.
- Advanced validation, permission hardening, and broader negative-path coverage remain future work.
