package main

import (
	"log"

	"circleup/internal/config"
	"circleup/internal/http"
	"circleup/internal/store"
)

func main() {
	cfg := config.Load()
	st := store.NewMemoryStore()
	server := http.NewServer(cfg, st)

	log.Printf("api listening on %s", cfg.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
