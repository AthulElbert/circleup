package store

import (
	"errors"
	"sync"
	"time"

	"circleup/internal/models"
)

var ErrNotFound = errors.New("not found")

// MemoryStore is a sprint-1 placeholder for persistence.
type MemoryStore struct {
	mu    sync.RWMutex
	users map[string]models.User
	otps  map[string]models.OTP
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		users: make(map[string]models.User),
		otps:  make(map[string]models.OTP),
	}
}

func (s *MemoryStore) SaveOTP(email, code string, expiresAt int64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.otps[email] = models.OTP{Email: email, Code: code, ExpiresAt: expiresAt}
}

func (s *MemoryStore) GetOTP(email string) (models.OTP, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	otp, ok := s.otps[email]
	if !ok {
		return models.OTP{}, ErrNotFound
	}
	return otp, nil
}

func (s *MemoryStore) DeleteOTP(email string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.otps, email)
}

func (s *MemoryStore) SaveUser(u models.User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.users[u.Email] = u
}

func (s *MemoryStore) GetUserByEmail(email string) (models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	u, ok := s.users[email]
	if !ok {
		return models.User{}, ErrNotFound
	}
	return u, nil
}

func (s *MemoryStore) PurgeExpiredOTPs(now time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for email, otp := range s.otps {
		if otp.ExpiresAt <= now.Unix() {
			delete(s.otps, email)
		}
	}
}
