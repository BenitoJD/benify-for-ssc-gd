package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"benify/apps/api/internal/auth"
)

type AuthService interface {
	AuthenticateGoogle(credential string) (auth.LoginResult, error)
	ReadSession(r *http.Request) (auth.User, error)
}

type Config struct {
	AllowedOrigin string
	CookieName    string
	CookieSecure  bool
	Auth          AuthService
}

type Server struct {
	config Config
	mux    *http.ServeMux
}

func NewServer(config Config) *Server {
	server := &Server{
		config: config,
		mux:    http.NewServeMux(),
	}

	server.routes()
	return server
}

func (s *Server) Handler() http.Handler {
	return s.withCORS(s.mux)
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /healthz", s.handleHealth)
	s.mux.HandleFunc("POST /api/v1/auth/google", s.handleGoogleLogin)
	s.mux.HandleFunc("GET /api/v1/auth/me", s.handleMe)
	s.mux.HandleFunc("POST /api/v1/auth/logout", s.handleLogout)
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data": map[string]string{
			"status": "ok",
		},
	})
}

func (s *Server) handleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Credential string `json:"credential"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.Credential == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"error":   "credential is required",
		})
		return
	}

	result, err := s.config.Auth.AuthenticateGoogle(request.Credential)
	if err != nil {
		status := http.StatusUnauthorized
		if errors.Is(err, auth.ErrEmailNotVerified) {
			status = http.StatusForbidden
		}

		writeJSON(w, status, map[string]any{
			"success": false,
			"error":   "google authentication failed",
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     s.config.CookieName,
		Value:    result.SessionToken,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   s.config.CookieSecure,
		MaxAge:   int((12 * time.Hour).Seconds()),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    result.User,
	})
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	user, err := s.config.Auth.ReadSession(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{
			"success": false,
			"error":   "not authenticated",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    user,
	})
}

func (s *Server) handleLogout(w http.ResponseWriter, _ *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     s.config.CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   s.config.CookieSecure,
		MaxAge:   -1,
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data": map[string]string{
			"status": "logged_out",
		},
	})
}

func (s *Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin == s.config.AllowedOrigin {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, payload map[string]any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
