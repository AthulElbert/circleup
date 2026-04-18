package store

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"

	"circleup/internal/models"
)

var ErrNotFound = errors.New("not found")

type Store interface {
	SaveOTP(email, code string, expiresAt int64)
	GetOTP(email string) (models.OTP, error)
	DeleteOTP(email string)
	SaveUser(u models.User)
	GetUserByEmail(email string) (models.User, error)
	PurgeExpiredOTPs(now time.Time)
	CreateTopic(name string) models.Topic
	ListTopics() []models.Topic
	GetTopic(id string) (models.Topic, error)
	CreateRoom(title, topicID, visibility, ownerEmail string) models.Room
	UpdateRoom(room models.Room)
	ListRooms() []models.Room
	GetRoom(id string) (models.Room, error)
	SaveInvite(code, roomID string) models.Invite
	GetInvite(code string) (models.Invite, error)
}

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
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
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
	sort.Slice(out, func(i, j int) bool { return out[i].Title < out[j].Title })
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

type SQLiteStore struct {
	db *sql.DB
}

func NewSQLiteStore(db *sql.DB) *SQLiteStore {
	return &SQLiteStore{db: db}
}

func nextDBID(prefix string) string {
	buf := make([]byte, 4)
	_, _ = rand.Read(buf)
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(buf))
}

func (s *SQLiteStore) SaveOTP(email, code string, expiresAt int64) {
	_, _ = s.db.Exec(`
		INSERT INTO otp_tokens (email, code, expires_at)
		VALUES (?, ?, ?)
		ON CONFLICT(email) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at
	`, email, code, expiresAt)
}

func (s *SQLiteStore) GetOTP(email string) (models.OTP, error) {
	var otp models.OTP
	err := s.db.QueryRow(`SELECT email, code, expires_at FROM otp_tokens WHERE email = ?`, email).Scan(&otp.Email, &otp.Code, &otp.ExpiresAt)
	if errors.Is(err, sql.ErrNoRows) {
		return models.OTP{}, ErrNotFound
	}
	return otp, err
}

func (s *SQLiteStore) DeleteOTP(email string) {
	_, _ = s.db.Exec(`DELETE FROM otp_tokens WHERE email = ?`, email)
}

func (s *SQLiteStore) SaveUser(u models.User) {
	if u.ID == "" {
		u.ID = nextDBID("user")
	}
	_, _ = s.db.Exec(`
		INSERT INTO users (id, email, password_hash)
		VALUES (?, ?, ?)
		ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash
	`, u.ID, u.Email, u.PasswordHash)
}

func (s *SQLiteStore) GetUserByEmail(email string) (models.User, error) {
	var user models.User
	err := s.db.QueryRow(`SELECT id, email, password_hash FROM users WHERE email = ?`, email).Scan(&user.ID, &user.Email, &user.PasswordHash)
	if errors.Is(err, sql.ErrNoRows) {
		return models.User{}, ErrNotFound
	}
	return user, err
}

func (s *SQLiteStore) PurgeExpiredOTPs(now time.Time) {
	_, _ = s.db.Exec(`DELETE FROM otp_tokens WHERE expires_at <= ?`, now.Unix())
}

func (s *SQLiteStore) CreateTopic(name string) models.Topic {
	topic := models.Topic{ID: nextDBID("topic"), Name: name}
	_, _ = s.db.Exec(`INSERT INTO topics (id, name) VALUES (?, ?)`, topic.ID, topic.Name)
	return topic
}

func (s *SQLiteStore) ListTopics() []models.Topic {
	rows, err := s.db.Query(`SELECT id, name FROM topics ORDER BY name ASC`)
	if err != nil {
		return nil
	}
	defer rows.Close()
	out := []models.Topic{}
	for rows.Next() {
		var topic models.Topic
		if rows.Scan(&topic.ID, &topic.Name) == nil {
			out = append(out, topic)
		}
	}
	return out
}

func (s *SQLiteStore) GetTopic(id string) (models.Topic, error) {
	var topic models.Topic
	err := s.db.QueryRow(`SELECT id, name FROM topics WHERE id = ?`, id).Scan(&topic.ID, &topic.Name)
	if errors.Is(err, sql.ErrNoRows) {
		return models.Topic{}, ErrNotFound
	}
	return topic, err
}

func (s *SQLiteStore) CreateRoom(title, topicID, visibility, ownerEmail string) models.Room {
	room := models.Room{ID: nextDBID("room"), Title: title, TopicID: topicID, Visibility: visibility, OwnerEmail: ownerEmail}
	_, _ = s.db.Exec(`INSERT INTO rooms (id, title, topic_id, visibility, owner_email, invite_code) VALUES (?, ?, ?, ?, ?, '')`, room.ID, room.Title, room.TopicID, room.Visibility, room.OwnerEmail)
	return room
}

func (s *SQLiteStore) UpdateRoom(room models.Room) {
	_, _ = s.db.Exec(`UPDATE rooms SET title = ?, topic_id = ?, visibility = ?, owner_email = ?, invite_code = ? WHERE id = ?`, room.Title, room.TopicID, room.Visibility, room.OwnerEmail, room.InviteCode, room.ID)
}

func (s *SQLiteStore) ListRooms() []models.Room {
	rows, err := s.db.Query(`SELECT id, title, topic_id, visibility, owner_email, invite_code FROM rooms ORDER BY title ASC`)
	if err != nil {
		return nil
	}
	defer rows.Close()
	out := []models.Room{}
	for rows.Next() {
		var room models.Room
		if rows.Scan(&room.ID, &room.Title, &room.TopicID, &room.Visibility, &room.OwnerEmail, &room.InviteCode) == nil {
			out = append(out, room)
		}
	}
	return out
}

func (s *SQLiteStore) GetRoom(id string) (models.Room, error) {
	var room models.Room
	err := s.db.QueryRow(`SELECT id, title, topic_id, visibility, owner_email, invite_code FROM rooms WHERE id = ?`, id).Scan(&room.ID, &room.Title, &room.TopicID, &room.Visibility, &room.OwnerEmail, &room.InviteCode)
	if errors.Is(err, sql.ErrNoRows) {
		return models.Room{}, ErrNotFound
	}
	return room, err
}

func (s *SQLiteStore) SaveInvite(code, roomID string) models.Invite {
	invite := models.Invite{Code: code, RoomID: roomID}
	_, _ = s.db.Exec(`INSERT INTO invites (code, room_id) VALUES (?, ?) ON CONFLICT(code) DO UPDATE SET room_id = excluded.room_id`, invite.Code, invite.RoomID)
	return invite
}

func (s *SQLiteStore) GetInvite(code string) (models.Invite, error) {
	var invite models.Invite
	err := s.db.QueryRow(`SELECT code, room_id FROM invites WHERE code = ?`, code).Scan(&invite.Code, &invite.RoomID)
	if errors.Is(err, sql.ErrNoRows) {
		return models.Invite{}, ErrNotFound
	}
	return invite, err
}
