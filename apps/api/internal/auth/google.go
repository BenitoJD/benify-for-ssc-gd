package auth

import (
	"context"
	"errors"
	"fmt"

	"google.golang.org/api/idtoken"
)

var ErrInvalidGoogleIdentity = errors.New("google token missing required claims")

type GoogleIDTokenVerifier struct{}

func (GoogleIDTokenVerifier) Verify(ctx context.Context, credential string, audience string) (*GoogleIdentity, error) {
	payload, err := idtoken.Validate(ctx, credential, audience)
	if err != nil {
		return nil, err
	}

	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)
	emailVerified, ok := payload.Claims["email_verified"].(bool)
	if !ok || payload.Subject == "" || email == "" {
		return nil, fmt.Errorf("%w: sub/email/email_verified", ErrInvalidGoogleIdentity)
	}

	return &GoogleIdentity{
		Subject:       payload.Subject,
		Email:         email,
		Name:          name,
		Picture:       picture,
		EmailVerified: emailVerified,
	}, nil
}
