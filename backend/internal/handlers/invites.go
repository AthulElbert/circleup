package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net/http"

	"circleup/internal/store"
)

func GenerateInvite(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct { RoomID string `json:"roomId"` }
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.RoomID == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "roomId is required"})
			return
		}
		room, err := st.GetRoom(req.RoomID)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "room not found"})
			return
		}
		code := nextInviteCode()
		st.SaveInvite(code, req.RoomID)
		room.InviteCode = code
		st.UpdateRoom(room)
		writeJSON(w, http.StatusCreated, map[string]string{"code": code, "roomId": req.RoomID})
	}
}

func JoinWithInvite(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct { Code string `json:"code"` }
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Code == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invite code is required"})
			return
		}
		invite, err := st.GetInvite(req.Code)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "invite not found"})
			return
		}
		room, err := st.GetRoom(invite.RoomID)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "room not found"})
			return
		}
		writeJSON(w, http.StatusOK, room)
	}
}

func nextInviteCode() string {
	buf := make([]byte, 3)
	_, _ = rand.Read(buf)
	return fmt.Sprintf("INV-%02X%02X%02X", buf[0], buf[1], buf[2])
}
