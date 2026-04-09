package http

import (
	"net/http"

	"circleup/internal/config"
	"circleup/internal/handlers"
	"circleup/internal/middleware"
	"circleup/internal/realtime"
	"circleup/internal/store"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewServer(cfg config.Config, st *store.MemoryStore) *http.Server {
	hub := realtime.NewHub()
	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/request-otp", handlers.RequestOTP(st))
		r.Post("/verify-otp", handlers.VerifyOTP(st, cfg.JWTSecret))
		r.Post("/login", handlers.Login(st, cfg.JWTSecret))
	})

	r.Get("/ws/rooms/{roomID}", handlers.RoomRealtime(hub, st, cfg.JWTSecret))

	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth(cfg.JWTSecret))
		r.Get("/protected", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		})

		r.Route("/topics", func(r chi.Router) {
			r.Post("/", handlers.CreateTopic(st))
			r.Get("/", handlers.ListTopics(st))
		})

		r.Route("/rooms", func(r chi.Router) {
			r.Post("/", handlers.CreateRoom(st))
			r.Get("/", handlers.ListRooms(st))
			r.Get("/{roomID}", handlers.GetRoomByID(st))
		})

		r.Route("/invites", func(r chi.Router) {
			r.Post("/generate", handlers.GenerateInvite(st))
			r.Post("/join", handlers.JoinWithInvite(st))
		})
	})

	return &http.Server{Addr: cfg.Addr, Handler: r}
}
