package config

import (
	"os"
	"strings"
)

type Config struct {
	Addr           string
	DBURL          string
	JWTSecret      string
	AllowedOrigins []string
}

func Load() Config {
	return Config{
		Addr:           envOrDefault("API_ADDR", ":8080"),
		DBURL:          envOrDefault("DATABASE_URL", "postgres://user:pass@localhost:5432/circleup"),
		JWTSecret:      envOrDefault("JWT_SECRET", "dev-secret"),
		AllowedOrigins: splitCSV(envOrDefault("ALLOWED_ORIGINS", "http://*,https://*")),
	}
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}
