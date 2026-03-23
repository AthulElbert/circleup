# Sprint 2 Report - CircleUp

## Sprint Goal

Deliver an integrated Sprint 2 build where frontend and backend work together for:
- OTP signup and verification
- JWT login
- topics creation and listing
- rooms creation, listing, and detail view
- private room invite generation and invite join flow

## Team Progress on Sprint 1 Carryover

- Integrated frontend auth forms with backend endpoints
- Replaced mock login with real JWT login
- Added authenticated UI state in the header
- Completed protected frontend flows using backend-issued tokens

## Backend API Documentation

### Health

`GET /health`

Returns:
- `200 OK`
- body: `ok`

### Authentication

`POST /auth/request-otp`

Request body:
```json
{ "email": "test@circleup.com" }
```

Response:
- `200 OK`
- in dev mode with `DEV_OTP=true`, response also includes `otp`

Example:
```json
{ "message": "otp sent", "otp": "123456" }
```

`POST /auth/verify-otp`

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

Example:
```json
{ "message": "verified" }
```

`POST /auth/login`

Request body:
```json
{
  "email": "test@circleup.com",
  "password": "pass123"
}
```

Response:
- `200 OK`

Example:
```json
{ "token": "<jwt-token>" }
```

### Protected Route

`GET /protected`

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`
- body: `ok`

### Topics

`POST /topics/`

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

Example:
```json
{ "id": "topic_001", "name": "System Design" }
```

`GET /topics/`

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`

Example:
```json
[
  { "id": "topic_001", "name": "System Design" }
]
```

### Rooms

`POST /rooms/`

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

Example:
```json
{
  "id": "room_002",
  "title": "Interview Prep",
  "topicId": "topic_001",
  "visibility": "private",
  "ownerEmail": "test@circleup.com"
}
```

`GET /rooms/`

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK`

`GET /rooms/{roomID}`

Headers:
```text
Authorization: Bearer <jwt-token>
```

Response:
- `200 OK` if found
- `404` if room does not exist

### Invites

`POST /invites/generate`

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

Example:
```json
{ "code": "INV-ABC123", "roomId": "room_002" }
```

`POST /invites/join`

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

## Frontend Testing Added

- Cypress e2e smoke test:
  - `frontend/cypress/e2e/login-page.cy.js`
- Frontend unit tests:
  - `frontend/src/lib/validators.test.js`
  - `frontend/src/store/authSlice.test.js`
  - `frontend/src/components/TopicForm.test.jsx`
  - `frontend/src/components/AuthGate.test.jsx`

## Backend Testing Added

- `backend/internal/handlers/auth_test.go`
- `backend/internal/handlers/invites_test.go`
- `backend/internal/handlers/topics_rooms_test.go`
- `backend/internal/store/store_test.go`

## Completed in Sprint 2

- Integrated frontend and backend
- Completed auth flow using real backend JWT
- Added topics, rooms, room details, and invite join flows
- Added invite generation to frontend
- Added backend API documentation
- Added backend unit tests
- Added frontend Cypress smoke test
- Added frontend unit tests

## Still Incomplete

- Frontend unit tests are not yet at a 1:1 ratio with functions/components
- Backend unit tests are improved but not yet at a full 1:1 ratio with all functions
- No advanced Cypress journey beyond a simple smoke test
