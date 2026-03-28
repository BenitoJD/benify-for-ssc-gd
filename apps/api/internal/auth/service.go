package auth

import (
	"context"
	"errors"
	"strings"
	"time"
)

var ErrEmailNotVerified = errors.New("google account email is not verified")

type GoogleIdentity struct {
	Subject       string
	Email         string
	Name          string
	Picture       string
	EmailVerified bool
}

type GoogleVerifier interface {
	Verify(ctx context.Context, credential string, audience string) (*GoogleIdentity, error)
}

type LoginResult struct {
	User         User   `json:"user"`
	SessionToken string `json:"-"`
}

type Service struct {
	verifier GoogleVerifier
	sessions *SessionCodec
	audience string
}

func NewService(verifier GoogleVerifier, sessions *SessionCodec, audience string) *Service {
	return &Service{
		verifier: verifier,
		sessions: sessions,
		audience: audience,
	}
}

func (s *Service) AuthenticateGoogle(ctx context.Context, credential string, now time.Time) (LoginResult, error) {
	identity, err := s.verifier.Verify(ctx, credential, s.audience)
	if err != nil {
		return LoginResult{}, err
	}

	if !identity.EmailVerified {
		return LoginResult{}, ErrEmailNotVerified
	}

	user := User{
		Subject: identity.Subject,
		Email:   strings.TrimSpace(strings.ToLower(identity.Email)),
		Name:    strings.TrimSpace(identity.Name),
		Picture: strings.TrimSpace(identity.Picture),
	}

	token, err := s.sessions.Encode(user, now)
	if err != nil {
		return LoginResult{}, err
	}

	return LoginResult{
		User:         user,
		SessionToken: token,
	}, nil
}

func (s *Service) ReadSession(token string, now time.Time) (User, error) {
	return s.sessions.Decode(token, now)
}
