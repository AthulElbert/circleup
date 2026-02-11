package db

import "database/sql"

func Connect(dbURL string) (*sql.DB, error) {
	return sql.Open("postgres", dbURL)
}
