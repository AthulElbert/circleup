package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"circleup/internal/store"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

func TestCreateAndListTopics(t *testing.T) {
	st := store.NewMemoryStore()

	createReq := httptest.NewRequest(http.MethodPost, "/topics/", bytes.NewBufferString(`{"name":"Tech"}`))
	createRw := httptest.NewRecorder()
	CreateTopic(st).ServeHTTP(createRw, createReq)
	if createRw.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", createRw.Code)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/topics/", nil)
	listRw := httptest.NewRecorder()
	ListTopics(st).ServeHTTP(listRw, listReq)
	if listRw.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", listRw.Code)
	}

	var topics []map[string]string
	if err := json.Unmarshal(listRw.Body.Bytes(), &topics); err != nil {
		t.Fatal(err)
	}
	if len(topics) != 1 || topics[0]["name"] != "Tech" {
		t.Fatalf("expected one topic named Tech, got %#v", topics)
	}
}

func TestCreateRoomAndGetByID(t *testing.T) {
	st := store.NewMemoryStore()
	topic := st.CreateTopic("Systems")

	req := httptest.NewRequest(http.MethodPost, "/rooms/", bytes.NewBufferString(`{"title":"Architecture","topicId":"`+topic.ID+`","visibility":"private"}`))
	req = req.WithContext(context.WithValue(req.Context(), "claims", jwt.MapClaims{"sub": "owner@circleup.com"}))
	rw := httptest.NewRecorder()
	CreateRoom(st).ServeHTTP(rw, req)
	if rw.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", rw.Code)
	}

	var room map[string]string
	if err := json.Unmarshal(rw.Body.Bytes(), &room); err != nil {
		t.Fatal(err)
	}
	if room["ownerEmail"] != "owner@circleup.com" {
		t.Fatalf("expected owner email to be set, got %#v", room)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/rooms/"+room["id"], nil)
	routeCtx := chi.NewRouteContext()
	routeCtx.URLParams.Add("roomID", room["id"])
	getReq = getReq.WithContext(context.WithValue(getReq.Context(), chi.RouteCtxKey, routeCtx))
	getRw := httptest.NewRecorder()
	GetRoomByID(st).ServeHTTP(getRw, getReq)
	if getRw.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", getRw.Code)
	}
}

func TestCreateRoomRejectsUnknownTopic(t *testing.T) {
	st := store.NewMemoryStore()

	req := httptest.NewRequest(http.MethodPost, "/rooms/", bytes.NewBufferString(`{"title":"Architecture","topicId":"missing-topic","visibility":"public"}`))
	req = req.WithContext(context.WithValue(req.Context(), "claims", jwt.MapClaims{"sub": "owner@circleup.com"}))
	rw := httptest.NewRecorder()
	CreateRoom(st).ServeHTTP(rw, req)
	if rw.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rw.Code)
	}
}
