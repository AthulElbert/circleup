package store

import (
	"testing"

	"circleup/internal/db"
)

func TestTopicAndRoomLifecycleAcrossStores(t *testing.T) {
	tests := []struct { name string; store Store }{{name:"memory", store: NewMemoryStore()}, {name:"sqlite", store: newSQLiteTestStore(t)}}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			topic := tc.store.CreateTopic("System Design")
			if topic.ID == "" { t.Fatal("expected topic id to be generated") }
			storedTopic, err := tc.store.GetTopic(topic.ID)
			if err != nil { t.Fatalf("expected topic to be retrievable: %v", err) }
			if storedTopic.Name != "System Design" { t.Fatalf("expected topic name to match, got %q", storedTopic.Name) }
			room := tc.store.CreateRoom("Interview Prep", topic.ID, "private", "owner@circleup.com")
			if room.ID == "" { t.Fatal("expected room id to be generated") }
			storedRoom, err := tc.store.GetRoom(room.ID)
			if err != nil { t.Fatalf("expected room to be retrievable: %v", err) }
			if storedRoom.TopicID != topic.ID { t.Fatalf("expected room topic id %q, got %q", topic.ID, storedRoom.TopicID) }
			room.InviteCode = "INV-ABC123"
			tc.store.UpdateRoom(room)
			updatedRoom, err := tc.store.GetRoom(room.ID)
			if err != nil { t.Fatalf("expected updated room to be retrievable: %v", err) }
			if updatedRoom.InviteCode != "INV-ABC123" { t.Fatalf("expected invite code to persist, got %q", updatedRoom.InviteCode) }
		})
	}
}

func newSQLiteTestStore(t *testing.T) Store {
	t.Helper()
	sqlDB, err := db.Connect(":memory:")
	if err != nil { t.Fatalf("connect sqlite: %v", err) }
	t.Cleanup(func() { _ = sqlDB.Close() })
	if err := db.EnsureSchema(sqlDB); err != nil { t.Fatalf("ensure schema: %v", err) }
	return NewSQLiteStore(sqlDB)
}
