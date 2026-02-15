package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"circleup/internal/store"
)

func TestOTPFlow(t *testing.T) {
	st := store.NewMemoryStore()

	req := httptest.NewRequest(http.MethodPost, "/auth/request-otp", bytes.NewBufferString(`{"email":"a@b.com"}`))
	rw := httptest.NewRecorder()
	RequestOTP(st).ServeHTTP(rw, req)
	if rw.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rw.Code)
	}

	otp, err := st.GetOTP("a@b.com")
	if err != nil {
		t.Fatalf("expected otp stored")
	}

	verifyBody := []byte(`{"email":"a@b.com","otp":"` + otp.Code + `","password":"pass"}`)
	verifyReq := httptest.NewRequest(http.MethodPost, "/auth/verify-otp", bytes.NewBuffer(verifyBody))
	verifyRw := httptest.NewRecorder()
	VerifyOTP(st, "secret").ServeHTTP(verifyRw, verifyReq)
	if verifyRw.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", verifyRw.Code)
	}
}
