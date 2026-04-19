package realtime

import (
	"encoding/json"
	"fmt"
	"sort"
	"sync"
	"time"
)

type Participant struct {
	Email    string `json:"email"`
	Role     string `json:"role"`
	MicOn    bool   `json:"micOn"`
	CamOn    bool   `json:"camOn"`
	Muted    bool   `json:"muted"`
	IsHost   bool   `json:"isHost"`
	JoinedAt string `json:"joinedAt"`
}

type ChatMessage struct {
	ID          string `json:"id"`
	SenderEmail string `json:"senderEmail"`
	Body        string `json:"body"`
	SentAt      string `json:"sentAt"`
}

type Snapshot struct {
	Participants []Participant `json:"participants"`
	Messages     []ChatMessage `json:"messages"`
}

type Event struct {
	Type        string       `json:"type"`
	Action      string       `json:"action,omitempty"`
	Participant *Participant `json:"participant,omitempty"`
	Message     *ChatMessage `json:"message,omitempty"`
	Signal      *Signal      `json:"signal,omitempty"`
	Snapshot    *Snapshot    `json:"snapshot,omitempty"`
	Error       string       `json:"error,omitempty"`
}

type Signal struct {
	FromEmail string          `json:"fromEmail"`
	ToEmail   string          `json:"toEmail"`
	Kind      string          `json:"kind"`
	Payload   json.RawMessage `json:"payload"`
}

type roomState struct {
	participants map[string]Participant
	clients      map[string]chan Event
	messages     []ChatMessage
	seq          int
}

type Hub struct {
	mu    sync.Mutex
	rooms map[string]*roomState
}

func NewHub() *Hub {
	return &Hub{rooms: make(map[string]*roomState)}
}

func (h *Hub) Join(roomID, email string, isHost bool) (Participant, Snapshot, chan Event) {
	h.mu.Lock()
	defer h.mu.Unlock()

	room := h.ensureRoom(roomID)
	role := "participant"
	if isHost {
		role = "host"
	}
	participant := Participant{
		Email:    email,
		Role:     role,
		MicOn:    true,
		CamOn:    true,
		Muted:    false,
		IsHost:   isHost,
		JoinedAt: time.Now().UTC().Format(time.RFC3339),
	}
	room.participants[email] = participant
	events := make(chan Event, 16)
	room.clients[email] = events
	snapshot := Snapshot{Participants: sortedParticipants(room.participants), Messages: append([]ChatMessage(nil), room.messages...)}
	h.broadcastLocked(room, Event{Type: "presence", Action: "joined", Participant: &participant}, email)
	return participant, snapshot, events
}

func (h *Hub) Leave(roomID, email string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return
	}
	participant, hadParticipant := room.participants[email]
	delete(room.participants, email)
	if ch, ok := room.clients[email]; ok {
		delete(room.clients, email)
		close(ch)
	}
	if hadParticipant {
		h.broadcastLocked(room, Event{Type: "presence", Action: "left", Participant: &participant}, email)
	}
	if len(room.participants) == 0 && len(room.clients) == 0 {
		delete(h.rooms, roomID)
	}
}

func (h *Hub) UpdateMedia(roomID, email string, micOn, camOn bool) (Participant, bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return Participant{}, false
	}
	participant, ok := room.participants[email]
	if !ok {
		return Participant{}, false
	}
	if participant.Muted {
		micOn = false
	}
	participant.MicOn = micOn
	participant.CamOn = camOn
	room.participants[email] = participant
	h.broadcastLocked(room, Event{Type: "media", Participant: &participant}, "")
	return participant, true
}

func (h *Hub) MuteParticipant(roomID, actorEmail, targetEmail string) (Participant, bool, string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return Participant{}, false, "room not found"
	}
	actor, ok := room.participants[actorEmail]
	if !ok || !canModerate(actor, targetEmail, room.participants) {
		return Participant{}, false, "only host or co-host can mute this participant"
	}
	participant := room.participants[targetEmail]
	participant.Muted = true
	participant.MicOn = false
	room.participants[targetEmail] = participant
	event := Event{Type: "moderation", Action: "muted", Participant: &participant}
	h.broadcastLocked(room, event, "")
	return participant, true, ""
}

func (h *Hub) UnmuteParticipant(roomID, actorEmail, targetEmail string) (Participant, bool, string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return Participant{}, false, "room not found"
	}
	actor, ok := room.participants[actorEmail]
	if !ok || !canModerate(actor, targetEmail, room.participants) {
		return Participant{}, false, "only host or co-host can unmute this participant"
	}
	participant := room.participants[targetEmail]
	participant.Muted = false
	room.participants[targetEmail] = participant
	event := Event{Type: "moderation", Action: "unmuted", Participant: &participant}
	h.broadcastLocked(room, event, "")
	return participant, true, ""
}

func (h *Hub) KickParticipant(roomID, actorEmail, targetEmail string) (Participant, bool, string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return Participant{}, false, "room not found"
	}
	actor, ok := room.participants[actorEmail]
	if !ok || !canModerate(actor, targetEmail, room.participants) {
		return Participant{}, false, "only host or co-host can remove this participant"
	}
	participant := room.participants[targetEmail]
	if ch, ok := room.clients[targetEmail]; ok {
		select {
		case ch <- Event{Type: "moderation", Action: "kicked", Participant: &participant, Error: "You were removed from the live room by moderation."}:
		default:
		}
	}
	return participant, true, ""
}

func (h *Hub) UpdateRole(roomID, actorEmail, targetEmail, nextRole string) (Participant, bool, string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return Participant{}, false, "room not found"
	}
	actor, ok := room.participants[actorEmail]
	if !ok || actor.Role != "host" {
		return Participant{}, false, "only the host can update participant roles"
	}
	if actorEmail == targetEmail {
		return Participant{}, false, "host cannot change their own role"
	}
	participant, ok := room.participants[targetEmail]
	if !ok {
		return Participant{}, false, "participant not found"
	}
	if participant.Role == "host" {
		return Participant{}, false, "host role cannot be reassigned here"
	}
	if nextRole != "co-host" && nextRole != "participant" {
		return Participant{}, false, "invalid role"
	}
	participant.Role = nextRole
	participant.IsHost = false
	room.participants[targetEmail] = participant
	action := "role-updated"
	if nextRole == "co-host" {
		action = "promoted"
	} else if nextRole == "participant" {
		action = "demoted"
	}
	event := Event{Type: "moderation", Action: action, Participant: &participant}
	h.broadcastLocked(room, event, "")
	return participant, true, ""
}

func (h *Hub) AddChat(roomID, email, body string) (ChatMessage, bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return ChatMessage{}, false
	}
	room.seq++
	msg := ChatMessage{ID: fmt.Sprintf("%s-%03d", roomID, room.seq), SenderEmail: email, Body: body, SentAt: time.Now().UTC().Format(time.RFC3339)}
	room.messages = append(room.messages, msg)
	if len(room.messages) > 50 {
		room.messages = append([]ChatMessage(nil), room.messages[len(room.messages)-50:]...)
	}
	h.broadcastLocked(room, Event{Type: "chat", Message: &msg}, "")
	return msg, true
}

func (h *Hub) RelaySignal(roomID, fromEmail, toEmail, kind string, payload json.RawMessage) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	room, ok := h.rooms[roomID]
	if !ok {
		return false
	}
	ch, ok := room.clients[toEmail]
	if !ok {
		return false
	}
	event := Event{Type: "signal", Signal: &Signal{FromEmail: fromEmail, ToEmail: toEmail, Kind: kind, Payload: payload}}
	select {
	case ch <- event:
	default:
	}
	return true
}

func canModerate(actor Participant, targetEmail string, participants map[string]Participant) bool {
	target, ok := participants[targetEmail]
	if !ok {
		return false
	}
	if actor.Email == targetEmail {
		return false
	}
	switch actor.Role {
	case "host":
		return target.Role != "host"
	case "co-host":
		return target.Role == "participant"
	default:
		return false
	}
}

func (h *Hub) ensureRoom(roomID string) *roomState {
	room, ok := h.rooms[roomID]
	if !ok {
		room = &roomState{participants: make(map[string]Participant), clients: make(map[string]chan Event), messages: make([]ChatMessage, 0)}
		h.rooms[roomID] = room
	}
	return room
}

func (h *Hub) broadcastLocked(room *roomState, event Event, skipEmail string) {
	for email, ch := range room.clients {
		if email == skipEmail {
			continue
		}
		select {
		case ch <- event:
		default:
		}
	}
}

func roleRank(role string) int {
	switch role {
	case "host":
		return 0
	case "co-host":
		return 1
	default:
		return 2
	}
}

func sortedParticipants(values map[string]Participant) []Participant {
	out := make([]Participant, 0, len(values))
	for _, participant := range values {
		out = append(out, participant)
	}
	sort.Slice(out, func(i, j int) bool {
		if roleRank(out[i].Role) != roleRank(out[j].Role) {
			return roleRank(out[i].Role) < roleRank(out[j].Role)
		}
		return out[i].Email < out[j].Email
	})
	return out
}
