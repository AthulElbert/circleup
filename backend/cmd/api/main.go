package main

import (
	"log"

	"circleup/internal/config"
	"circleup/internal/db"
	apphttp "circleup/internal/http"
	"circleup/internal/store"
)

func main() {
	cfg := config.Load()
	sqlDB, err := db.Connect(cfg.DBURL)
	if err != nil { log.Fatal(err) }
	defer sqlDB.Close()
	if err := db.EnsureSchema(sqlDB); err != nil { log.Fatal(err) }
	st := store.NewSQLiteStore(sqlDB)
	server := apphttp.NewServer(cfg, st)
	log.Printf("api listening on %s (db: %s)", cfg.Addr, cfg.DBURL)
	if err := server.ListenAndServe(); err != nil { log.Fatal(err) }
}
