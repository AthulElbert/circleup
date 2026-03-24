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
- Backend handler/API test coverage for Sprint 2 resources
- Verification of topic and room API behavior
- Coverage for auth and invite handler flows

### Sona
- Backend runtime integration support for Sprint 2 flows
- Store-level validation coverage
- Support for topics, rooms, and invite persistence behavior in tests

## User Stories

- As a user, I want to sign up and verify OTP through the real backend so the frontend auth flow is fully integrated.
- As a returning user, I want to log in and receive a real JWT so protected frontend pages use real authentication.
- As an authenticated user, I want to create topics so rooms can be organized around discussion areas.
- As an authenticated user, I want to create public or private rooms tied to a topic.
- As an authenticated user, I want to list existing rooms and inspect room details.
- As a host, I want to generate an invite code for a private room.
- As a user, I want to join a room using an invite code.
- As a developer, I want frontend and backend tests so Sprint 2 functionality is verifiable.
- As a developer, I want backend API documentation so the system is easy to demo and maintain.

## Planned Issues (with Owner)

- FE-1 (Balaji): Add Topics page and integrate topic creation/listing with backend.
- FE-2 (Balaji): Add Rooms page and Create Room page using backend room APIs.
- FE-3 (Balaji): Add Room Details page and route integration.
- FE-4 (Balaji): Add Join Invite page and page-level success/error states.
- FE-5 (Balaji): Improve page-level empty/loading states for Sprint 2 flows.

- FE-6 (Ramcharan): Replace mock login with real backend JWT login.
- FE-7 (Ramcharan): Update header/auth state to reflect logged-in user and logout.
- FE-8 (Ramcharan): Add invite generation UX to the room list.
- FE-9 (Ramcharan): Add frontend unit tests for validation, auth state, and route protection.
- FE-10 (Ramcharan): Add a simple Cypress smoke test for the login page.

- BE-1 (Athul): Add handler-level tests for topics and rooms.
- BE-2 (Athul): Verify auth and invite handler behavior for Sprint 2 integration.
- BE-3 (Athul): Validate API behavior used by frontend topics/rooms/invite flows.

- BE-4 (Sona): Add store-level tests for topic and room persistence behavior.
- BE-5 (Sona): Support integrated frontend/backend runtime behavior for Sprint 2 flows.
- BE-6 (Sona): Ensure backend support for invite-related room state updates.

- TEAM-1 (Entire Team): Integrate frontend and backend across auth, topics, rooms, and invites.
- TEAM-2 (Entire Team): Document backend API in `Sprint2.md`.

## Completion Status

### Completed

- FE-1, FE-2, FE-3, FE-4, FE-5
  - Result: Sprint 2 page-level frontend flows are integrated and demo-ready.

- FE-6, FE-7, FE-8, FE-9, FE-10
  - Result: Shared frontend auth behavior, testing, and Cypress smoke coverage are in place.

- BE-1, BE-2, BE-3, BE-4, BE-5, BE-6
  - Result: Backend verification and test coverage support the integrated Sprint 2 application.

- TEAM-1, TEAM-2
  - Result: Frontend and backend are integrated, and backend API documentation is included in this report.

## Detail Work Completed in Sprint 2

### Integration and Sprint 1 Carryover Completion

- Integrated frontend auth pages with real backend endpoints.
- Replaced mock frontend login behavior with real JWT login from the backend.
- Connected frontend protected flows to backend-issued authentication state.
- Completed authenticated header behavior showing logged-in user email and logout option.
- Resolved browser-to-backend integration issues so frontend API calls work in the running application.

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

- Verified auth endpoints as the frontend integration base.
- Verified topics endpoints for create and list behavior.
- Verified rooms endpoints for create, list, and get-by-id behavior.
- Verified invite endpoints for invite generation and invite join behavior.
- Added store-level and handler-level backend tests for Sprint 2 resources.

## Evidence of Completion

### Frontend
- Signup, verify, and login now call real backend endpoints.
- Login stores a real JWT and allows protected frontend flows.
- Topics, rooms, room details, invite generation, and invite join are available from the UI.
- Header reflects authenticated state and supports logout.
- Frontend unit tests and Cypress smoke test are present and runnable.

### Backend
- Endpoints implemented and exercised by the integrated frontend:
  - `GET /health`
  - `POST /auth/request-otp`
  - `POST /auth/verify-otp`
  - `POST /auth/login`
  - `GET /protected`
  - `POST /topics/`
  - `GET /topics/`
  - `POST /rooms/`
  - `GET /rooms/`
  - `GET /rooms/{roomID}`
  - `POST /invites/generate`
  - `POST /invites/join`
- Backend unit tests exist for auth, invites, topics/rooms, and store behavior.

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
- Verifies the OTP and creates or activates the user account

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
- Creates a new topic

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

## Planned But Not Completed

- Frontend unit tests are not at a 1:1 ratio with functions/components.
  - Why: Sprint effort focused on establishing baseline frontend coverage plus one Cypress smoke path.

- Backend unit tests are not at a full 1:1 ratio with all handlers/store functions.
  - Why: Sprint effort prioritized the core topic, room, invite, and auth paths used in the integrated demo.

- Cypress coverage is limited to a simple smoke test and does not yet cover a full user journey.
  - Why: Sprint requirement only required a very simple Cypress test, so scope stayed minimal.

- Advanced validation, permission hardening, and broader negative-path coverage remain future work.
  - Why: Sprint 2 prioritized full-stack integration and demonstrable working flows over edge-case hardening.

## Branch/Folders Delivered In Sprint 2

- `circleup/balajiSprint2`
- `circleup/ramSprint2`
- `circleup/athulSprint2`
- `circleup/sonaSprint2`
- `circleup/main` (merged, runnable snapshot)

## Demo Readiness Checklist

- Frontend and backend run together as an integrated application.
- Signup, verify, and login use real backend APIs.
- Topics, rooms, and invites are demonstrable from the UI.
- Backend tests pass with `go test ./...`.
- Frontend unit tests pass with `npm test`.
- Cypress smoke test passes with `npm run cypress:run`.
