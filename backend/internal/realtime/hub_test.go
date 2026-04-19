package realtime

import "testing"

func TestHubJoinChatAndLeave(t *testing.T) {
	hub := NewHub()

	alice, snapshot, aliceEvents := hub.Join("room_001", "alice@circleup.com", true)
	if alice.Email != "alice@circleup.com" {
		t.Fatalf("expected alice participant, got %q", alice.Email)
	}
	if alice.Role != "host" || !alice.IsHost {
		t.Fatalf("expected alice to be marked as host")
	}
	if len(snapshot.Participants) != 1 {
		t.Fatalf("expected 1 participant in snapshot, got %d", len(snapshot.Participants))
	}

	_, _, bobEvents := hub.Join("room_001", "bob@circleup.com", false)
	joined := <-aliceEvents
	if joined.Type != "presence" || joined.Action != "joined" || joined.Participant == nil || joined.Participant.Email != "bob@circleup.com" {
		t.Fatalf("expected bob joined presence event, got %#v", joined)
	}
	if joined.Participant.Role != "participant" {
		t.Fatalf("expected participant role, got %s", joined.Participant.Role)
	}

	msg, ok := hub.AddChat("room_001", "alice@circleup.com", "hello")
	if !ok || msg.Body != "hello" {
		t.Fatalf("expected chat add to succeed")
	}
	<-aliceEvents
	received := <-bobEvents
	if received.Type != "chat" || received.Message == nil || received.Message.Body != "hello" {
		t.Fatalf("expected bob chat event, got %#v", received)
	}

	updated, ok := hub.UpdateMedia("room_001", "bob@circleup.com", false, true)
	if !ok || updated.MicOn {
		t.Fatalf("expected bob mic to be updated")
	}

	media := <-aliceEvents
	if media.Type != "media" || media.Participant == nil || media.Participant.Email != "bob@circleup.com" || media.Participant.MicOn {
		t.Fatalf("expected media event for bob, got %#v", media)
	}

	hub.Leave("room_001", "bob@circleup.com")
	left := <-aliceEvents
	if left.Type != "presence" || left.Action != "left" || left.Participant == nil || left.Participant.Email != "bob@circleup.com" {
		t.Fatalf("expected bob left presence event, got %#v", left)
	}
}

func TestHubRelaySignal(t *testing.T) {
	hub := NewHub()

	_, _, aliceEvents := hub.Join("room_002", "alice@circleup.com", true)
	_, _, bobEvents := hub.Join("room_002", "bob@circleup.com", false)
	_, _, charlieEvents := hub.Join("room_002", "charlie@circleup.com", false)

	<-aliceEvents
	<-aliceEvents
	<-bobEvents

	ok := hub.RelaySignal("room_002", "alice@circleup.com", "bob@circleup.com", "offer", []byte(`{"type":"offer"}`))
	if !ok {
		t.Fatalf("expected signal relay to succeed")
	}

	event := <-bobEvents
	if event.Type != "signal" || event.Signal == nil {
		t.Fatalf("expected signal event, got %#v", event)
	}
	select {
	case unexpected := <-charlieEvents:
		t.Fatalf("expected signal to be targeted only to bob, got %#v", unexpected)
	default:
	}
}

func TestRolePromotionAndModeration(t *testing.T) {
	hub := NewHub()
	_, _, hostEvents := hub.Join("room_003", "host@circleup.com", true)
	_, _, guestEvents := hub.Join("room_003", "guest@circleup.com", false)
	_, _, memberEvents := hub.Join("room_003", "member@circleup.com", false)
	<-hostEvents
	<-hostEvents
	<-guestEvents

	guest, ok, reason := hub.UpdateRole("room_003", "host@circleup.com", "guest@circleup.com", "co-host")
	if !ok || reason != "" {
		t.Fatalf("expected promotion to succeed, got %q", reason)
	}
	if guest.Role != "co-host" {
		t.Fatalf("expected co-host role, got %s", guest.Role)
	}
	promoted := <-hostEvents
	if promoted.Action != "promoted" || promoted.Participant == nil || promoted.Participant.Role != "co-host" {
		t.Fatalf("expected promote event, got %#v", promoted)
	}
	guestEvent := <-guestEvents
	if guestEvent.Action != "promoted" {
		t.Fatalf("expected guest to receive promoted event")
	}
	memberEvent := <-memberEvents
	if memberEvent.Action != "promoted" {
		t.Fatalf("expected member to receive promoted event")
	}

	member, ok, reason := hub.MuteParticipant("room_003", "guest@circleup.com", "member@circleup.com")
	if !ok || reason != "" {
		t.Fatalf("expected co-host mute to succeed, got %q", reason)
	}
	if !member.Muted {
		t.Fatalf("expected member to be muted")
	}
	<-hostEvents
	<-guestEvents
	mutedEvent := <-memberEvents
	if mutedEvent.Action != "muted" {
		t.Fatalf("expected muted event for member, got %#v", mutedEvent)
	}

	member, ok, reason = hub.UnmuteParticipant("room_003", "host@circleup.com", "member@circleup.com")
	if !ok || reason != "" || member.Muted {
		t.Fatalf("expected host unmute to succeed")
	}
	<-hostEvents
	<-guestEvents
	unmutedEvent := <-memberEvents
	if unmutedEvent.Action != "unmuted" {
		t.Fatalf("expected unmuted event, got %#v", unmutedEvent)
	}
}

func TestModerationRestrictions(t *testing.T) {
	hub := NewHub()
	_, _, hostEvents := hub.Join("room_004", "host@circleup.com", true)
	_, _, cohostEvents := hub.Join("room_004", "cohost@circleup.com", false)
	_, _, memberEvents := hub.Join("room_004", "member@circleup.com", false)
	<-hostEvents
	<-hostEvents
	<-cohostEvents

	if _, ok, _ := hub.UpdateRole("room_004", "member@circleup.com", "cohost@circleup.com", "co-host"); ok {
		t.Fatalf("expected non-host promotion to fail")
	}
	if _, ok, _ := hub.UpdateRole("room_004", "host@circleup.com", "cohost@circleup.com", "co-host"); !ok {
		t.Fatalf("expected host promotion to succeed")
	}
	<-hostEvents
	<-cohostEvents
	<-memberEvents

	if _, ok, _ := hub.MuteParticipant("room_004", "cohost@circleup.com", "host@circleup.com"); ok {
		t.Fatalf("expected co-host mute against host to fail")
	}
	if _, ok, _ := hub.KickParticipant("room_004", "cohost@circleup.com", "host@circleup.com"); ok {
		t.Fatalf("expected co-host kick against host to fail")
	}
	if _, ok, _ := hub.KickParticipant("room_004", "cohost@circleup.com", "member@circleup.com"); !ok {
		t.Fatalf("expected co-host kick against participant to succeed")
	}
	kicked := <-memberEvents
	if kicked.Action != "kicked" {
		t.Fatalf("expected kicked event, got %#v", kicked)
	}
}


func TestRoleValidationAndChatRetention(t *testing.T) {
	hub := NewHub()
	_, _, hostEvents := hub.Join("room_005", "host@circleup.com", true)
	_, _, guestEvents := hub.Join("room_005", "guest@circleup.com", false)
	<-hostEvents

	if _, ok, reason := hub.UpdateRole("room_005", "host@circleup.com", "guest@circleup.com", "owner"); ok || reason != "invalid role" {
		t.Fatalf("expected invalid role rejection, got ok=%v reason=%q", ok, reason)
	}

	for i := 0; i < 55; i++ {
		if _, ok := hub.AddChat("room_005", "host@circleup.com", "message"); !ok {
			t.Fatalf("expected chat append to succeed at %d", i)
		}
	}

	room := hub.rooms["room_005"]
	if len(room.messages) != 50 {
		t.Fatalf("expected chat retention cap of 50, got %d", len(room.messages))
	}
	if room.messages[0].ID != "room_005-006" {
		t.Fatalf("expected oldest retained message to be room_005-006, got %s", room.messages[0].ID)
	}

	// drain guest events so the buffer does not hide chat broadcasts.
	for len(guestEvents) > 0 {
		<-guestEvents
	}
}
