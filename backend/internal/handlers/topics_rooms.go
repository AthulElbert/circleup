package handlers

import (
	"encoding/json"
	"net/http"

	"circleup/internal/store"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

func CreateTopic(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct { Name string `json:"name"` }
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name is required"})
			return
		}
		writeJSON(w, http.StatusCreated, st.CreateTopic(req.Name))
	}
}

func ListTopics(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, st.ListTopics())
	}
}

func CreateRoom(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Title      string `json:"title"`
			TopicID    string `json:"topicId"`
			Visibility string `json:"visibility"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid payload"})
			return
		}
		if req.Title == "" || req.TopicID == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title and topicId are required"})
			return
		}
		if req.Visibility == "" {
			req.Visibility = "public"
		}
		if req.Visibility != "public" && req.Visibility != "private" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "visibility must be public or private"})
			return
		}
		if _, err := st.GetTopic(req.TopicID); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "topic not found"})
			return
		}

		claims, _ := r.Context().Value("claims").(jwt.MapClaims)
		ownerEmail, _ := claims["sub"].(string)
		writeJSON(w, http.StatusCreated, st.CreateRoom(req.Title, req.TopicID, req.Visibility, ownerEmail))
	}
}

func ListRooms(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, st.ListRooms())
	}
}

func GetRoomByID(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		room, err := st.GetRoom(chi.URLParam(r, "roomID"))
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "room not found"})
			return
		}
		writeJSON(w, http.StatusOK, room)
	}
}
