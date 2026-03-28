package auth

import (
	"testing"
	"time"
)

func TestSessionCodecEncodeDecode(t *testing.T) {
	t.Parallel()

	codec := NewSessionCodec([]byte("super-secret-key"), 2*time.Hour)
	user := User{
		Subject: "google-subject",
		Email:   "learner@example.com",
		Name:    "Benito",
		Picture: "https://example.com/avatar.png",
	}

	token, err := codec.Encode(user, time.Now())
	if err != nil {
		t.Fatalf("Encode() error = %v", err)
	}

	got, err := codec.Decode(token, time.Now())
	if err != nil {
		t.Fatalf("Decode() error = %v", err)
	}

	if got != user {
		t.Fatalf("Decode() user = %#v, want %#v", got, user)
	}
}

func TestSessionCodecRejectsTamperedToken(t *testing.T) {
	t.Parallel()

	codec := NewSessionCodec([]byte("super-secret-key"), 2*time.Hour)
	token, err := codec.Encode(User{Subject: "123", Email: "learner@example.com"}, time.Now())
	if err != nil {
		t.Fatalf("Encode() error = %v", err)
	}

	tampered := token[:len(token)-1] + "x"
	if _, err := codec.Decode(tampered, time.Now()); err == nil {
		t.Fatal("Decode() error = nil, want signature error")
	}
}

func TestSessionCodecRejectsExpiredToken(t *testing.T) {
	t.Parallel()

	codec := NewSessionCodec([]byte("super-secret-key"), 1*time.Minute)
	issuedAt := time.Now().Add(-2 * time.Minute)

	token, err := codec.Encode(User{Subject: "123", Email: "learner@example.com"}, issuedAt)
	if err != nil {
		t.Fatalf("Encode() error = %v", err)
	}

	if _, err := codec.Decode(token, time.Now()); err == nil {
		t.Fatal("Decode() error = nil, want expiry error")
	}
}
