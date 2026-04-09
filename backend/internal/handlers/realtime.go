package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"circleup/internal/realtime"
	"circleup/internal/store"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func RoomRealtime(hub *realtime.Hub, st *store.MemoryStore, secret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomID := chi.URLParam(r, "roomID")
		if roomID == "" {
			http.Error(w, "room id required", http.StatusBadRequest)
			return
		}
		if _, err := st.GetRoom(roomID); err != nil {
			http.Error(w, "room not found", http.StatusNotFound)
			return
		}

		email, err := emailFromToken(r.URL.Query(), secret)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		participant, snapshot, events := hub.Join(roomID, email)
		defer hub.Leave(roomID, email)

		if err := conn.WriteJSON(realtime.Event{Type: "snapshot", Snapshot: &snapshot}); err != nil {
			return
		}

		done := make(chan struct{})
		go func() {
			defer close(done)
			for event := range events {
				if err := conn.WriteJSON(event); err != nil {
					return
				}
			}
		}()

		for {
			var msg struct {
				Type    string          `json:"type"`
				Body    string          `json:"body"`
				MicOn   *bool           `json:"micOn"`
				CamOn   *bool           `json:"camOn"`
				ToEmail string          `json:"toEmail"`
				Kind    string          `json:"kind"`
				Payload json.RawMessage `json:"payload"`
			}

			if err := conn.ReadJSON(&msg); err != nil {
				return
			}

			switch msg.Type {
			case "chat":
				body := strings.TrimSpace(msg.Body)
				if body == "" {
					continue
				}
				hub.AddChat(roomID, email, body)
			case "media":
				micOn := participant.MicOn
				camOn := participant.CamOn
				if msg.MicOn != nil {
					micOn = *msg.MicOn
				}
				if msg.CamOn != nil {
					camOn = *msg.CamOn
				}
				updated, ok := hub.UpdateMedia(roomID, email, micOn, camOn)
				if ok {
					participant = updated
				}
			case "signal":
				if strings.TrimSpace(msg.ToEmail) == "" || !isAllowedSignalKind(msg.Kind) || len(msg.Payload) == 0 {
					continue
				}
				if msg.ToEmail == email {
					continue
				}
				hub.RelaySignal(roomID, email, msg.ToEmail, msg.Kind, msg.Payload)
			default:
			}

			select {
			case <-done:
				return
			default:
			}
		}
	}
}

func emailFromToken(values url.Values, secret string) (string, error) {
	tokenStr := values.Get("token")
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return "", err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", jwt.ErrTokenInvalidClaims
	}
	email, _ := claims["sub"].(string)
	if strings.TrimSpace(email) == "" {
		return "", jwt.ErrTokenInvalidClaims
	}
	return email, nil
}

func isAllowedSignalKind(kind string) bool {
	switch kind {
	case "offer", "answer", "ice":
		return true
	default:
		return false
	}
}
