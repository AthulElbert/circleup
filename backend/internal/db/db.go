package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

func Connect(dbURL string) (*sql.DB, error) {
	return sql.Open("sqlite", dbURL)
}

func EnsureSchema(db *sql.DB) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)`,
		`CREATE TABLE IF NOT EXISTS otp_tokens (email TEXT PRIMARY KEY, code TEXT NOT NULL, expires_at INTEGER NOT NULL)`,
		`CREATE TABLE IF NOT EXISTS topics (id TEXT PRIMARY KEY, name TEXT NOT NULL)`,
		`CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, title TEXT NOT NULL, topic_id TEXT NOT NULL, visibility TEXT NOT NULL, owner_email TEXT NOT NULL, invite_code TEXT NOT NULL DEFAULT '')`,
		`CREATE TABLE IF NOT EXISTS invites (code TEXT PRIMARY KEY, room_id TEXT NOT NULL)`,
	}
	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil { return err }
	}
	return nil
}
