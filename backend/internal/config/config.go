package config

import "os"

type Config struct {
	Addr      string
	DBURL     string
	JWTSecret string
}

func Load() Config {
	return Config{
		Addr:      envOrDefault("API_ADDR", ":8080"),
		DBURL:     envOrDefault("DATABASE_URL", "postgres://user:pass@localhost:5432/circleup"),
		JWTSecret: envOrDefault("JWT_SECRET", "dev-secret"),
	}
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
