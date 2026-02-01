 # CircleUp

## Project Description
CircleUp is a planned real-time, topic-based video chat web app where users will create Circles (rooms), join live video calls, and chat around shared interests. The project is designed as a two-service system: a Go REST API for authentication and room management, and a Go WebSocket/WebRTC service for signaling and live communication. A modern React frontend will provide the UI for browsing topics, creating rooms, and joining calls.


## Core Features (Planned)

- Topic-based rooms (Circles) with a single assigned topic
- Public or private rooms with shareable invite codes
- OTP signup flow and email/password login
- Real-time video and audio via WebRTC
- WebSocket-based group chat per room
- Host moderation controls (mute or remove participants)
- Explicit in-call mic/camera toggles

## Architecture Overview

- Frontend: Vite + React, Redux Toolkit, React Router, Tailwind CSS, shadcn/ui
- Backend API: Go + Chi, GORM, PostgreSQL
- Realtime: Go + Fiber WebSockets, Pion WebRTC, STUN/TURN support
- Testing: Cypress (frontend), Go httptest + testify (backend)

## Planned API Surface (High Level)

- Auth: request OTP, verify OTP, login
- Topics: create and list topics
- Rooms: create, list, fetch by ID
- User preferences: set and get topic preferences

## Setup (To Be Implemented)

This section will be updated once the project scaffolding is in place.

## Repository Structure (Planned)

- backend/    Go API + realtime services
- frontend/   React UI
- docs/       Diagrams and technical notes

## Members

- front-end engineers : Balaji Jonnalagadda, Ramcharan Reddy Mannam
- back-end engineers : Athul Oscar Ronaldo Elbert, Sona Maria Jose
