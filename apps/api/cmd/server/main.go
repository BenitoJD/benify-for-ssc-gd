package main

import (
	"log"
	"net/http"
	"time"

	"benify/apps/api/internal/auth"
	"benify/apps/api/internal/config"
	"benify/apps/api/internal/httpapi"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	authService := auth.NewService(
		auth.GoogleIDTokenVerifier{},
		auth.NewSessionCodec([]byte(cfg.SessionSecret), cfg.SessionTTL),
		cfg.GoogleClientID,
	)

	server := httpapi.NewServer(httpapi.Config{
		AllowedOrigin: cfg.AppOrigin,
		CookieName:    cfg.CookieName,
		CookieSecure:  cfg.CookieSecure,
		Auth: httpapi.AuthAdapter{
			Service:    authService,
			CookieName: cfg.CookieName,
			Now:        time.Now,
		},
	})

	log.Printf("api listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, server.Handler()); err != nil {
		log.Fatalf("serve: %v", err)
	}
}
