# CircleUp Frontend

## Current Scope

- auth, topics, rooms, invites
- live room UI with presence, chat, media toggles, and WebRTC signaling
- Cypress smoke coverage and Vitest unit coverage

## Run Locally

```powershell
cd C:\Personal_projects\testsprint2\circleup\frontend
$env:VITE_API_BASE_URL="http://localhost:8080"
$env:VITE_WS_BASE_URL="ws://localhost:8080"
npm run dev -- --host 0.0.0.0 --port 5173
```

## LAN / Multi-Laptop Testing

If the backend is running on another laptop on the same network:

```powershell
$env:VITE_API_BASE_URL="http://<HOST_IP>:8080"
$env:VITE_WS_BASE_URL="ws://<HOST_IP>:8080"
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open:

- `http://<HOST_IP>:5173`

on each laptop.

## STUN / TURN Configuration

- `VITE_STUN_SERVER_URLS` - comma-separated STUN URLs
- `VITE_TURN_SERVER_URLS` - comma-separated TURN URLs
- `VITE_TURN_USERNAME` - TURN username
- `VITE_TURN_CREDENTIAL` - TURN credential

Example:

```powershell
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
$env:VITE_TURN_SERVER_URLS="turn:turn.example.com:3478"
$env:VITE_TURN_USERNAME="user"
$env:VITE_TURN_CREDENTIAL="pass"
```

## Test

```powershell
cd C:\Personal_projects\testsprint2\circleup\frontend
npm test
npm run cypress:run
```
