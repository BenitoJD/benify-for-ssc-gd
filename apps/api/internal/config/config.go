package config

import (
	"errors"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port           string
	AppOrigin      string
	GoogleClientID string
	SessionSecret  string
	CookieName     string
	CookieSecure   bool
	SessionTTL     time.Duration
}

func Load() (Config, error) {
	config := Config{
		Port:           envOrDefault("PORT", "8080"),
		AppOrigin:      envOrDefault("APP_ORIGIN", "http://localhost:5173"),
		GoogleClientID: os.Getenv("GOOGLE_CLIENT_ID"),
		SessionSecret:  os.Getenv("SESSION_SECRET"),
		CookieName:     envOrDefault("COOKIE_NAME", "benify_session"),
		SessionTTL:     12 * time.Hour,
	}

	secure, err := strconv.ParseBool(envOrDefault("COOKIE_SECURE", "false"))
	if err != nil {
		return Config{}, err
	}
	config.CookieSecure = secure

	if config.GoogleClientID == "" {
		return Config{}, errors.New("GOOGLE_CLIENT_ID is required")
	}

	if len(config.SessionSecret) < 32 {
		return Config{}, errors.New("SESSION_SECRET must be at least 32 characters")
	}

	return config, nil
}

func envOrDefault(key string, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
