package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"circleup/internal/models"
	"circleup/internal/store"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func RequestOTP(st *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct{ Email string `json:"email"` }
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid email"})
			return
		}

		code := generateOTP()
		exp := time.Now().Add(5 * time.Minute).Unix()
		st.SaveOTP(req.Email, code, exp)

		if os.Getenv("DEV_OTP") == "true" {
			writeJSON(w, http.StatusOK, map[string]string{"message": "otp sent", "otp": code})
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"message": "otp sent"})
	}
}

func VerifyOTP(st *store.MemoryStore, secret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			OTP      string `json:"otp"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid payload"})
			return
		}

		otp, err := st.GetOTP(req.Email)
		if err != nil || otp.Code != req.OTP || time.Now().Unix() > otp.ExpiresAt {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid otp"})
			return
		}

		hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		st.SaveUser(models.User{Email: req.Email, PasswordHash: string(hash)})
		st.DeleteOTP(req.Email)

		writeJSON(w, http.StatusOK, map[string]string{"message": "verified"})
	}
}

func Login(st *store.MemoryStore, secret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid payload"})
			return
		}

		user, err := st.GetUserByEmail(req.Email)
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid login"})
			return
		}

		if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid login"})
			return
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": req.Email,
			"exp": time.Now().Add(24 * time.Hour).Unix(),
		})
		signed, _ := token.SignedString([]byte(secret))

		writeJSON(w, http.StatusOK, map[string]string{"token": signed})
	}
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func generateOTP() string {
	b := make([]byte, 3)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%06d", int(b[0])<<8|int(b[1]))
}
