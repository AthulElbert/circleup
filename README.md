# CircleUp

CircleUp is a topic-based realtime discussion application. Users can verify an account with OTP, log in, create public or private rooms, invite other users, and join a live room with chat, participant presence, device controls, moderation, and WebRTC signaling.

## What The Application Does
- OTP signup and account verification
- JWT-based login
- Topic creation and room creation
- Public and private rooms
- Invite code generation and invite-based join
- Live room with chat, presence, reconnect handling, and moderation
- SQLite persistence for local/demo runtime

## Stack
- Frontend: React, Vite, Redux Toolkit, Tailwind CSS
- Backend: Go, Chi, Gorilla WebSocket
- Realtime: WebSocket room hub + WebRTC signaling
- Persistence: SQLite
- Testing: Vitest, Cypress, Go unit tests

## Requirements
Install these before running the project:
- Go 1.24 or later
- Node.js 20 or later with npm
- Git Bash or PowerShell
- Chrome or Edge

Optional for media testing:
- camera and microphone devices
- trusted local HTTPS certificates if testing media outside plain `localhost`
- TURN server credentials for harder network environments

## Project Structure
- `backend/` - Go API, realtime hub, signaling, moderation, persistence
- `frontend/` - React UI, live-room UX, unit tests, Cypress tests
- `backend/migrations/` - SQLite schema bootstrap
- `Sprint1.md`, `Sprint2.md`, `Sprint3.md`, `Sprint4.md` - sprint documentation

## Install Dependencies

### Backend
```powershell
cd C:\Personal_projects\circleup\backend
go mod tidy
```

### Frontend
```powershell
cd C:\Personal_projects\circleup\frontend
cmd /c npm install
```

## Environment Variables

### Backend
- `API_ADDR` - bind address, example `0.0.0.0:8080`
- `DATABASE_URL` - SQLite file path, example `circleup.db`
- `JWT_SECRET` - token signing secret
- `DEV_OTP` - set to `true` to expose OTP in local demo responses
- `ALLOWED_ORIGINS` - comma-separated CORS origins

### Frontend
- `VITE_API_BASE_URL` - REST API base URL
- `VITE_WS_BASE_URL` - WebSocket base URL
- `VITE_STUN_SERVER_URLS` - comma-separated STUN server URLs
- `VITE_TURN_SERVER_URLS` - comma-separated TURN server URLs
- `VITE_TURN_USERNAME` - TURN username
- `VITE_TURN_CREDENTIAL` - TURN credential
- `VITE_DEV_HTTPS` - `true` to run Vite over HTTPS
- `VITE_DEV_SSL_KEY` - local HTTPS key path
- `VITE_DEV_SSL_CERT` - local HTTPS cert path
- `VITE_HMR_HOST` - host/IP for HMR when using LAN/HTTPS dev

## Run The Application

### 1. Start the backend
```powershell
cd C:\Personal_projects\circleup\backend
$env:API_ADDR="0.0.0.0:8080"
$env:DATABASE_URL="circleup.db"
$env:JWT_SECRET="dev-secret"
$env:DEV_OTP="true"
$env:ALLOWED_ORIGINS="http://localhost:5173,https://localhost:5173,http://127.0.0.1:5173,https://127.0.0.1:5173"
go run ./cmd/api
```

### 2. Start the frontend over HTTP
```powershell
cd C:\Personal_projects\circleup\frontend
$env:VITE_API_BASE_URL="http://localhost:8080"
$env:VITE_WS_BASE_URL="ws://localhost:8080"
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
```

Open:
- `http://localhost:5173`

### 3. Start the frontend over HTTPS for local media testing
```powershell
cd C:\Personal_projects\circleup\frontend
$env:VITE_API_BASE_URL="http://localhost:8080"
$env:VITE_WS_BASE_URL="ws://localhost:8080"
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
$env:VITE_DEV_HTTPS="true"
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
```

If you have trusted local certificates:
```powershell
$env:VITE_DEV_SSL_KEY="C:\certs\circleup-key.pem"
$env:VITE_DEV_SSL_CERT="C:\certs\circleup-cert.pem"
```

## How To Use The Application

### Auth flow
1. Open `http://localhost:5173`
2. Click `Sign up`
3. Request OTP using an email address
4. If `DEV_OTP=true`, inspect the OTP in the network response
5. Open `Verify OTP`
6. Submit email, OTP, and password
7. Open `Login`
8. Log in with the same credentials

### Topic and room flow
1. Open `Topics` after login
2. Create one or more topics
3. Open `Create Room`
4. Create a public or private room linked to a topic
5. Open `Rooms` to browse rooms
6. For private rooms, click `Generate Invite`
7. Open `View details` to inspect room data
8. Open `Join Invite` to join a room using an invite code

### Live room flow
1. From `Rooms` or room details, click `Join live room` or `Open live room`
2. Allow camera and microphone permissions if prompted
3. Use the live room to:
   - view participants
   - send chat messages
   - toggle microphone and camera
   - switch media devices
4. If you are host or co-host, use moderation controls in the participant list

### Moderation and roles
- Host can:
  - mute and unmute participants
  - remove participants
  - promote a participant to co-host
  - demote a co-host to participant
- Co-host can:
  - mute and unmute participants
  - remove participants
- Participant can:
  - join, chat, and control their own local mic/cam

## Multi-Laptop / LAN Demo
Use the host machine IP instead of `localhost`.

Example if the host machine IP is `192.168.0.157`:
```powershell
cd C:\Personal_projects\circleup\frontend
$env:VITE_API_BASE_URL="http://192.168.0.157:8080"
$env:VITE_WS_BASE_URL="ws://192.168.0.157:8080"
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
cmd /c npm run dev -- --host 0.0.0.0 --port 5173
```

Open on both laptops:
- `http://192.168.0.157:5173`

Notes:
- both laptops must be on the same network
- backend must run on the host laptop
- for media permissions on LAN, HTTPS is preferred
- firewall may need to allow ports `5173` and `8080`

## Testing

### Backend unit tests
```powershell
cd C:\Personal_projects\circleup\backend
go test ./...
```

### Backend focused verbose run
```powershell
cd C:\Personal_projects\circleup\backend
go test -v ./internal/handlers ./internal/realtime ./internal/store
```

### Frontend unit tests
```powershell
cd C:\Personal_projects\circleup\frontend
cmd /c npm test
```

### Frontend production build
```powershell
cd C:\Personal_projects\circleup\frontend
cmd /c npm run build
```

### Cypress end-to-end tests
Start the frontend dev server first, then run:
```powershell
cd C:\Personal_projects\circleup\frontend
cmd /c npm run cypress:run
```

Current Cypress coverage includes:
- login page smoke test
- auth flow
- room management flow
- live-room entry
- live-room chat
- live-room moderation
- muted-user behavior

## Troubleshooting

### PowerShell blocks npm
Use:
```powershell
cmd /c npm run dev
cmd /c npm test
cmd /c npm run build
cmd /c npm run cypress:run
```

### Camera or microphone is blocked
- allow camera and microphone for the site in browser settings
- check Windows privacy settings
- prefer HTTPS for LAN media testing
- close other apps using the same devices

### Realtime works but media does not
Typical causes:
- browser permission denied
- insecure origin on LAN HTTP
- no compatible STUN/TURN path for the current network

### Second laptop cannot connect
Check:
- host IP is correct
- frontend is started with `--host 0.0.0.0`
- firewall is not blocking `5173` or `8080`
- frontend env vars point to the host machine, not `localhost`

## Team
- Frontend engineers: Balaji Jonnalagadda, Ramcharan Reddy Mannam
- Backend engineers: Athul Oscar Ronaldo Elbert, Sona Maria Jose
