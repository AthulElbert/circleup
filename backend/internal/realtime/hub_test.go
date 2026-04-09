package realtime

import "testing"

func TestHubJoinChatAndLeave(t *testing.T) {
	hub := NewHub()

	alice, snapshot, aliceEvents := hub.Join("room_001", "alice@circleup.com")
	if alice.Email != "alice@circleup.com" {
		t.Fatalf("expected alice participant, got %q", alice.Email)
	}
	if len(snapshot.Participants) != 1 {
		t.Fatalf("expected 1 participant in snapshot, got %d", len(snapshot.Participants))
	}
	if len(snapshot.Messages) != 0 {
		t.Fatalf("expected empty message history")
	}

	_, _, bobEvents := hub.Join("room_001", "bob@circleup.com")
	joined := <-aliceEvents
	if joined.Type != "presence" || joined.Action != "joined" || joined.Participant == nil || joined.Participant.Email != "bob@circleup.com" {
		t.Fatalf("expected bob joined presence event, got %#v", joined)
	}

	msg, ok := hub.AddChat("room_001", "alice@circleup.com", "hello")
	if !ok {
		t.Fatalf("expected chat add to succeed")
	}
	if msg.Body != "hello" {
		t.Fatalf("expected message body to be preserved")
	}

	received := <-aliceEvents
	if received.Type != "chat" || received.Message == nil || received.Message.Body != "hello" {
		t.Fatalf("expected alice chat event, got %#v", received)
	}

	received = <-bobEvents
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

	_, _, aliceEvents := hub.Join("room_002", "alice@circleup.com")
	_, _, bobEvents := hub.Join("room_002", "bob@circleup.com")
	_, _, charlieEvents := hub.Join("room_002", "charlie@circleup.com")

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
	if event.Signal.FromEmail != "alice@circleup.com" || event.Signal.ToEmail != "bob@circleup.com" || event.Signal.Kind != "offer" {
		t.Fatalf("unexpected signal metadata: %#v", event.Signal)
	}
	if string(event.Signal.Payload) != `{"type":"offer"}` {
		t.Fatalf("unexpected signal payload: %s", string(event.Signal.Payload))
	}

	select {
	case unexpected := <-charlieEvents:
		t.Fatalf("expected signal to be targeted only to bob, got %#v", unexpected)
	default:
	}

	if hub.RelaySignal("room_002", "alice@circleup.com", "missing@circleup.com", "offer", []byte(`{"type":"offer"}`)) {
		t.Fatalf("expected missing target relay to fail")
	}
}
