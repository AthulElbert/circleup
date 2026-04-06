package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"circleup/internal/realtime"
	"circleup/internal/store"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

func TestEmailFromToken(t *testing.T) {
	secret := "secret"
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "alice@circleup.com",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}

	email, err := emailFromToken(url.Values{"token": []string{signed}}, secret)
	if err != nil {
		t.Fatalf("expected token parse to succeed: %v", err)
	}
	if email != "alice@circleup.com" {
		t.Fatalf("expected alice email, got %q", email)
	}
}

func TestRoomRealtimeRequiresExistingRoom(t *testing.T) {
	st := store.NewMemoryStore()
	hub := realtime.NewHub()
	req := httptest.NewRequest(http.MethodGet, "/ws/rooms/room_404?token=missing", nil)
	routeCtx := chi.NewRouteContext()
	routeCtx.URLParams.Add("roomID", "room_404")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, routeCtx))
	rw := httptest.NewRecorder()

	RoomRealtime(hub, st, "secret").ServeHTTP(rw, req)

	if rw.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rw.Code)
	}
}

func TestRoomRealtimeRequiresValidToken(t *testing.T) {
	st := store.NewMemoryStore()
	topic := st.CreateTopic("Systems")
	room := st.CreateRoom("Architecture", topic.ID, "public", "owner@circleup.com")
	hub := realtime.NewHub()

	req := httptest.NewRequest(http.MethodGet, "/ws/rooms/"+room.ID, nil)
	routeCtx := chi.NewRouteContext()
	routeCtx.URLParams.Add("roomID", room.ID)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, routeCtx))
	rw := httptest.NewRecorder()

	RoomRealtime(hub, st, "secret").ServeHTTP(rw, req)

	if rw.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rw.Code)
	}
}

func TestAllowedSignalKinds(t *testing.T) {
	for _, kind := range []string{"offer", "answer", "ice"} {
		if !isAllowedSignalKind(kind) {
			t.Fatalf("expected %s to be allowed", kind)
		}
	}

	for _, kind := range []string{"", "presence", "chat", "candidate"} {
		if isAllowedSignalKind(kind) {
			t.Fatalf("expected %s to be rejected", kind)
		}
	}
}
