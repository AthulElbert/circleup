package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"circleup/internal/store"
)

func TestGenerateAndJoinInvite(t *testing.T) {
	st := store.NewMemoryStore()
	topic := st.CreateTopic("Tech")
	room := st.CreateRoom("System Design", topic.ID, "private", "owner@circleup.com")

	req := httptest.NewRequest(http.MethodPost, "/invites/generate", bytes.NewBufferString(`{"roomId":"`+room.ID+`"}`))
	rw := httptest.NewRecorder()
	GenerateInvite(st).ServeHTTP(rw, req)
	if rw.Code != http.StatusCreated {
		t.Fatalf("expected 201 got %d", rw.Code)
	}

	var generated map[string]string
	if err := json.Unmarshal(rw.Body.Bytes(), &generated); err != nil {
		t.Fatal(err)
	}

	joinReq := httptest.NewRequest(http.MethodPost, "/invites/join", bytes.NewBufferString(`{"code":"`+generated["code"]+`"}`))
	joinRw := httptest.NewRecorder()
	JoinWithInvite(st).ServeHTTP(joinRw, joinReq)
	if joinRw.Code != http.StatusOK {
		t.Fatalf("expected 200 got %d", joinRw.Code)
	}
}
