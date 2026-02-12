package models

type User struct {
	ID           string
	Email        string
	PasswordHash string
}

type OTP struct {
	Email     string
	Code      string
	ExpiresAt int64
}
