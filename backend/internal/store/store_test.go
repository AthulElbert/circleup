package store

import "testing"

func TestTopicAndRoomLifecycle(t *testing.T) {
	st := NewMemoryStore()

	topic := st.CreateTopic("System Design")
	if topic.ID == "" {
		t.Fatal("expected topic id to be generated")
	}

	storedTopic, err := st.GetTopic(topic.ID)
	if err != nil {
		t.Fatalf("expected topic to be retrievable: %v", err)
	}
	if storedTopic.Name != "System Design" {
		t.Fatalf("expected topic name to match, got %q", storedTopic.Name)
	}

	room := st.CreateRoom("Interview Prep", topic.ID, "private", "owner@circleup.com")
	if room.ID == "" {
		t.Fatal("expected room id to be generated")
	}

	storedRoom, err := st.GetRoom(room.ID)
	if err != nil {
		t.Fatalf("expected room to be retrievable: %v", err)
	}
	if storedRoom.TopicID != topic.ID {
		t.Fatalf("expected room topic id %q, got %q", topic.ID, storedRoom.TopicID)
	}

	room.InviteCode = "INV-ABC123"
	st.UpdateRoom(room)

	updatedRoom, err := st.GetRoom(room.ID)
	if err != nil {
		t.Fatalf("expected updated room to be retrievable: %v", err)
	}
	if updatedRoom.InviteCode != "INV-ABC123" {
		t.Fatalf("expected invite code to persist, got %q", updatedRoom.InviteCode)
	}
}
