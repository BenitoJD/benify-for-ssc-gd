package httpapi

import (
	"context"
	"net/http"
	"time"

	"benify/apps/api/internal/auth"
)

type AuthAdapter struct {
	Service    *auth.Service
	CookieName string
	Now        func() time.Time
}

func (a AuthAdapter) AuthenticateGoogle(credential string) (auth.LoginResult, error) {
	return a.Service.AuthenticateGoogle(context.Background(), credential, a.Now())
}

func (a AuthAdapter) ReadSession(r *http.Request) (auth.User, error) {
	cookie, err := r.Cookie(a.CookieName)
	if err != nil {
		return auth.User{}, auth.ErrInvalidSession
	}

	return a.Service.ReadSession(cookie.Value, a.Now())
}
