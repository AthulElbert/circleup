# CircleUp Backend

## Current Scope

- REST API for auth, topics, rooms, and invites
- websocket room endpoint for presence, chat, and WebRTC signaling
- in-memory store for local sprint demos

## Run Locally

```powershell
cd C:\Personal_projects\testsprint2\circleup\backend
$env:API_ADDR="0.0.0.0:8080"
$env:JWT_SECRET="dev-secret"
$env:DEV_OTP="true"
$env:ALLOWED_ORIGINS="http://*,https://*"
go run ./cmd/api
```

## LAN / Multi-Laptop Testing

- Bind the API to `0.0.0.0:8080`
- Set `ALLOWED_ORIGINS` wide enough for the frontend host, for example `http://*,https://*`
- Share the host laptop IP with all client laptops
- The websocket endpoint is served from the same backend:
  - `ws://<HOST_IP>:8080/ws/rooms/{roomID}?token=<jwt>`

## Key Environment Variables

- `API_ADDR` - backend bind address, use `0.0.0.0:8080` for LAN
- `JWT_SECRET` - JWT signing secret
- `DEV_OTP` - returns OTP in signup response for local demos
- `ALLOWED_ORIGINS` - comma-separated CORS allowlist

## Test

```powershell
cd C:\Personal_projects\testsprint2\circleup\backend
go test ./...
```
