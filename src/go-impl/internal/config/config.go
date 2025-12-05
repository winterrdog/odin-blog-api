package config

import "os"

type Config struct {
	MongoURI string
	DbName   string
	Port     string
}

func Load() *Config {
	return &Config{
		Port:     os.Getenv("PORT"),
		DbName:   os.Getenv("DB_NAME"),
		MongoURI: os.Getenv("MONGO_URI"),
	}
}
