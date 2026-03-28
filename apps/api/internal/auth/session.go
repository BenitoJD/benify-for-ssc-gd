package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

var ErrInvalidSession = errors.New("invalid session")

type User struct {
	Subject string `json:"sub"`
	Email   string `json:"email"`
	Name    string `json:"name,omitempty"`
	Picture string `json:"picture,omitempty"`
}

type sessionPayload struct {
	User      User  `json:"user"`
	ExpiresAt int64 `json:"exp"`
}

type SessionCodec struct {
	secret []byte
	ttl    time.Duration
}

func NewSessionCodec(secret []byte, ttl time.Duration) *SessionCodec {
	return &SessionCodec{secret: secret, ttl: ttl}
}

func (c *SessionCodec) Encode(user User, now time.Time) (string, error) {
	payload := sessionPayload{
		User:      user,
		ExpiresAt: now.Add(c.ttl).Unix(),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	encoded := base64.RawURLEncoding.EncodeToString(body)
	signature := c.sign(encoded)
	return encoded + "." + signature, nil
}

func (c *SessionCodec) Decode(token string, now time.Time) (User, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return User{}, ErrInvalidSession
	}

	expected := c.sign(parts[0])
	if !hmac.Equal([]byte(parts[1]), []byte(expected)) {
		return User{}, ErrInvalidSession
	}

	body, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return User{}, ErrInvalidSession
	}

	var payload sessionPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return User{}, ErrInvalidSession
	}

	if now.Unix() >= payload.ExpiresAt {
		return User{}, ErrInvalidSession
	}

	return payload.User, nil
}

func (c *SessionCodec) sign(encoded string) string {
	mac := hmac.New(sha256.New, c.secret)
	_, _ = mac.Write([]byte(encoded))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
