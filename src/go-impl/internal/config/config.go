package config

import "os"

type Config struct {
	MongoURI    string
	DbName      string
	Port        string
	FrontendURL string
}

func Load() *Config {
	var (
		port        = os.Getenv("PORT")
		dbName      = os.Getenv("DB_NAME")
		mongoURI    = os.Getenv("MONGO_URI")
		frontendURL = os.Getenv("FRONTEND_URL")
	)

	if port == "" {
		panic("PORT environment variable is required")
	}
	if dbName == "" {
		panic("DB_NAME environment variable is required")
	}
	if mongoURI == "" {
		panic("MONGO_URI environment variable is required")
	}
	if frontendURL == "" {
		panic("FRONTEND_URL environment variable is required")
	}

	return &Config{
		Port:        port,
		DbName:      dbName,
		MongoURI:    mongoURI,
		FrontendURL: frontendURL,
	}
}
