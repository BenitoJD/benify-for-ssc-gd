package auth

import (
	"context"
	"errors"
	"testing"
	"time"
)

type fakeGoogleVerifier struct {
	payload *GoogleIdentity
	err     error
}

func (f fakeGoogleVerifier) Verify(_ context.Context, _ string, _ string) (*GoogleIdentity, error) {
	return f.payload, f.err
}

func TestServiceAuthenticateGoogle(t *testing.T) {
	t.Parallel()

	codec := NewSessionCodec([]byte("super-secret-key"), time.Hour)
	service := NewService(fakeGoogleVerifier{
		payload: &GoogleIdentity{
			Subject:       "google-123",
			Email:         "learner@example.com",
			Name:          "Benito",
			Picture:       "https://example.com/avatar.png",
			EmailVerified: true,
		},
	}, codec, "client-id")

	result, err := service.AuthenticateGoogle(context.Background(), "credential-token", time.Now())
	if err != nil {
		t.Fatalf("AuthenticateGoogle() error = %v", err)
	}

	if result.User.Email != "learner@example.com" {
		t.Fatalf("AuthenticateGoogle() email = %q, want learner@example.com", result.User.Email)
	}

	if result.SessionToken == "" {
		t.Fatal("AuthenticateGoogle() session token was empty")
	}
}

func TestServiceAuthenticateGoogleRejectsUnverifiedEmail(t *testing.T) {
	t.Parallel()

	codec := NewSessionCodec([]byte("super-secret-key"), time.Hour)
	service := NewService(fakeGoogleVerifier{
		payload: &GoogleIdentity{
			Subject:       "google-123",
			Email:         "learner@example.com",
			EmailVerified: false,
		},
	}, codec, "client-id")

	if _, err := service.AuthenticateGoogle(context.Background(), "credential-token", time.Now()); !errors.Is(err, ErrEmailNotVerified) {
		t.Fatalf("AuthenticateGoogle() error = %v, want ErrEmailNotVerified", err)
	}
}

func TestServiceAuthenticateGooglePropagatesVerifierError(t *testing.T) {
	t.Parallel()

	codec := NewSessionCodec([]byte("super-secret-key"), time.Hour)
	service := NewService(fakeGoogleVerifier{err: errors.New("verify failed")}, codec, "client-id")

	if _, err := service.AuthenticateGoogle(context.Background(), "credential-token", time.Now()); err == nil {
		t.Fatal("AuthenticateGoogle() error = nil, want verifier error")
	}
}
