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

type Topic struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Room struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	TopicID    string `json:"topicId"`
	Visibility string `json:"visibility"`
	OwnerEmail string `json:"ownerEmail"`
	InviteCode string `json:"inviteCode,omitempty"`
}

type Invite struct {
	Code   string `json:"code"`
	RoomID string `json:"roomId"`
}
