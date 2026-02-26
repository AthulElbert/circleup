package store

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"circleup/internal/models"
)

var ErrNotFound = errors.New("not found")

type MemoryStore struct {
	mu      sync.RWMutex
	users   map[string]models.User
	otps    map[string]models.OTP
	topics  map[string]models.Topic
	rooms   map[string]models.Room
	invites map[string]models.Invite
	seq     int
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		users:   make(map[string]models.User),
		otps:    make(map[string]models.OTP),
		topics:  make(map[string]models.Topic),
		rooms:   make(map[string]models.Room),
		invites: make(map[string]models.Invite),
	}
}

func (s *MemoryStore) nextID(prefix string) string {
	s.seq++
	return fmt.Sprintf("%s_%03d", prefix, s.seq)
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

func (s *MemoryStore) CreateTopic(name string) models.Topic {
	s.mu.Lock()
	defer s.mu.Unlock()
	topic := models.Topic{ID: s.nextID("topic"), Name: name}
	s.topics[topic.ID] = topic
	return topic
}

func (s *MemoryStore) ListTopics() []models.Topic {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Topic, 0, len(s.topics))
	for _, topic := range s.topics {
		out = append(out, topic)
	}
	return out
}

func (s *MemoryStore) GetTopic(id string) (models.Topic, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	topic, ok := s.topics[id]
	if !ok {
		return models.Topic{}, ErrNotFound
	}
	return topic, nil
}

func (s *MemoryStore) CreateRoom(title, topicID, visibility, ownerEmail string) models.Room {
	s.mu.Lock()
	defer s.mu.Unlock()
	room := models.Room{ID: s.nextID("room"), Title: title, TopicID: topicID, Visibility: visibility, OwnerEmail: ownerEmail}
	s.rooms[room.ID] = room
	return room
}

func (s *MemoryStore) UpdateRoom(room models.Room) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.rooms[room.ID] = room
}

func (s *MemoryStore) ListRooms() []models.Room {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Room, 0, len(s.rooms))
	for _, room := range s.rooms {
		out = append(out, room)
	}
	return out
}

func (s *MemoryStore) GetRoom(id string) (models.Room, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	room, ok := s.rooms[id]
	if !ok {
		return models.Room{}, ErrNotFound
	}
	return room, nil
}

func (s *MemoryStore) SaveInvite(code, roomID string) models.Invite {
	s.mu.Lock()
	defer s.mu.Unlock()
	invite := models.Invite{Code: code, RoomID: roomID}
	s.invites[code] = invite
	return invite
}

func (s *MemoryStore) GetInvite(code string) (models.Invite, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	invite, ok := s.invites[code]
	if !ok {
		return models.Invite{}, ErrNotFound
	}
	return invite, nil
}
