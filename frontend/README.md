# CircleUp Frontend

## Current Scope

- auth, topics, rooms, invites, and realtime live rooms
- host moderation controls for mute/remove
- live room UI with presence, chat, media toggles, reconnect handling, and WebRTC signaling
- Cypress smoke coverage and Vitest unit coverage

## Run Locally (HTTP)

```powershell
cd C:\Personal_projects\testsprint2\circleup\frontend
$env:VITE_API_BASE_URL="http://localhost:8080"
$env:VITE_WS_BASE_URL="ws://localhost:8080"
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
```

## Run Locally (HTTPS for camera/microphone)

Use HTTPS when testing media permissions across browsers. Vite will start with HTTPS when `VITE_DEV_HTTPS=true`.

### Quick self-signed mode

```powershell
cd C:\Personal_projects\testsprint2\circleup\frontend
$env:VITE_API_BASE_URL="http://localhost:8080"
$env:VITE_WS_BASE_URL="ws://localhost:8080"
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
$env:VITE_DEV_HTTPS="true"
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
```

### Trusted local certificate mode

If you generated local certs with `mkcert`, point Vite at them:

```powershell
$env:VITE_DEV_HTTPS="true"
$env:VITE_DEV_SSL_KEY="C:\certs\circleup-key.pem"
$env:VITE_DEV_SSL_CERT="C:\certs\circleup-cert.pem"
cmd /c npm run dev -- --host 0.0.0.0 --port 5173
```

Then open either:
- `https://localhost:5173`
- `https://<HOST_IP>:5173`

If you are testing from another laptop, also set:

```powershell
$env:VITE_API_BASE_URL="http://<HOST_IP>:8080"
$env:VITE_WS_BASE_URL="ws://<HOST_IP>:8080"
$env:VITE_HMR_HOST="<HOST_IP>"
```

## LAN / Multi-Laptop Testing

For multi-laptop testing on the same network:

```powershell
$env:VITE_API_BASE_URL="http://<HOST_IP>:8080"
$env:VITE_WS_BASE_URL="ws://<HOST_IP>:8080"
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
$env:VITE_DEV_HTTPS="true"
$env:VITE_HMR_HOST="<HOST_IP>"
cmd /c npm run dev -- --host 0.0.0.0 --port 5173
```

Then open:
- `https://<HOST_IP>:5173`

on each laptop.

## STUN / TURN Configuration

- `VITE_STUN_SERVER_URLS` - comma-separated STUN URLs
- `VITE_TURN_SERVER_URLS` - comma-separated TURN URLs
- `VITE_TURN_USERNAME` - TURN username
- `VITE_TURN_CREDENTIAL` - TURN credential

Example:

```powershell
$env:VITE_STUN_SERVER_URLS="stun:stun.l.google.com:19302"
$env:VITE_TURN_SERVER_URLS="turn:turn.example.com:3478,turns:turn.example.com:5349"
$env:VITE_TURN_USERNAME="user"
$env:VITE_TURN_CREDENTIAL="pass"
```

## Local Environment Template

Copy `frontend/.env.example` and adjust values for your machine, especially for HTTPS and TURN testing.

## Test

```powershell
cd C:\Personal_projects\testsprint2\circleup\frontend
cmd /c npm test
cmd /c npm run cypress:run
cmd /c npm run build
```
