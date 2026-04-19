# CircleUp Backend

## Current Scope

- REST API for auth, topics, rooms, and invites
- websocket room endpoint for presence, chat, WebRTC signaling, and moderation events
- SQLite-backed runtime persistence for local development and demos

## Run Locally

```powershell
cd C:\Personal_projects\testsprint2\circleup\backend
$env:API_ADDR="0.0.0.0:8080"
$env:DATABASE_URL="circleup.db"
$env:JWT_SECRET="dev-secret"
$env:DEV_OTP="true"
$env:ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,https://localhost:5173,https://127.0.0.1:5173"
go run ./cmd/api
```

## LAN / Multi-Laptop Testing

- Bind the API to `0.0.0.0:8080`
- Set `DATABASE_URL` to a shared local file path on the host laptop
- Set `ALLOWED_ORIGINS` wide enough for the frontend host, for example `http://<HOST_IP>:5173,https://<HOST_IP>:5173`
- Share the host laptop IP with all client laptops
- The websocket endpoint is served from the same backend:
  - `ws://<HOST_IP>:8080/ws/rooms/{roomID}?token=<jwt>`

If the frontend uses HTTPS, keep the websocket target as `ws://` only if the browser accepts it for local dev; otherwise terminate TLS in front of the backend or proxy websocket traffic through the HTTPS frontend host.

## Key Environment Variables

- `API_ADDR` - backend bind address, use `0.0.0.0:8080` for LAN
- `DATABASE_URL` - SQLite database file path, e.g. `circleup.db` or `C:\data\circleup.db`
- `JWT_SECRET` - JWT signing secret
- `DEV_OTP` - returns OTP in signup response for local demos
- `ALLOWED_ORIGINS` - comma-separated CORS allowlist

## Test

```powershell
cd C:\Personal_projects\testsprint2\circleup\backend
go test ./...
```
