package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"benify/apps/api/internal/auth"
)

type fakeAuthService struct {
	loginResult auth.LoginResult
	loginErr    error
	meUser      auth.User
	meErr       error
}

func (f fakeAuthService) AuthenticateGoogle(_ string) (auth.LoginResult, error) {
	return f.loginResult, f.loginErr
}

func (f fakeAuthService) ReadSession(_ *http.Request) (auth.User, error) {
	return f.meUser, f.meErr
}

func TestServerLoginSetsSessionCookie(t *testing.T) {
	t.Parallel()

	server := NewServer(Config{
		AllowedOrigin: "http://localhost:5173",
		CookieName:    "benify_session",
		CookieSecure:  false,
		Auth: fakeAuthService{
			loginResult: auth.LoginResult{
				User: auth.User{
					Subject: "google-123",
					Email:   "learner@example.com",
					Name:    "Benito",
				},
				SessionToken: "signed-session-token",
			},
		},
	})

	body, _ := json.Marshal(map[string]string{"credential": "google-credential"})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/auth/google", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Origin", "http://localhost:5173")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}

	cookie := recorder.Header().Get("Set-Cookie")
	if !strings.Contains(cookie, "benify_session=signed-session-token") {
		t.Fatalf("Set-Cookie = %q, want session token", cookie)
	}
}

func TestServerMeReturnsUnauthorizedWithoutSession(t *testing.T) {
	t.Parallel()

	server := NewServer(Config{
		AllowedOrigin: "http://localhost:5173",
		CookieName:    "benify_session",
		Auth: fakeAuthService{
			meErr: auth.ErrInvalidSession,
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestServerLogoutClearsSessionCookie(t *testing.T) {
	t.Parallel()

	server := NewServer(Config{
		AllowedOrigin: "http://localhost:5173",
		CookieName:    "benify_session",
		Auth:          fakeAuthService{},
	})

	request := httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}

	cookie := recorder.Header().Get("Set-Cookie")
	if !strings.Contains(cookie, "Max-Age=0") {
		t.Fatalf("Set-Cookie = %q, want cleared cookie", cookie)
	}
}
