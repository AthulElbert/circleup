package http

import (
	"net/http"

	"circleup/internal/config"
	"circleup/internal/handlers"
	"circleup/internal/middleware"
	"circleup/internal/store"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewServer(cfg config.Config, st *store.MemoryStore) *http.Server {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/request-otp", handlers.RequestOTP(st))
		r.Post("/verify-otp", handlers.VerifyOTP(st, cfg.JWTSecret))
		r.Post("/login", handlers.Login(st, cfg.JWTSecret))
	})

	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth(cfg.JWTSecret))
		r.Get("/protected", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		})
	})

	return &http.Server{
		Addr:    cfg.Addr,
		Handler: r,
	}
}
