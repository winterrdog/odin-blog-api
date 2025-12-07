package main

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/winterrdog/trie/internal/config"
	"github.com/winterrdog/trie/internal/db"
	"github.com/winterrdog/trie/internal/handlers"
	"github.com/winterrdog/trie/internal/middleware"
)

func main() {
	// godotenv.Load is optional - only needed for local dev
	// "docker compose" provides env vars directly
	_ = godotenv.Load(".env")

	// init logger
	log.SetOutput(gin.DefaultWriter)

	var (
		cfg = config.Load()
		ctx = context.Background()
	)

	db, err := db.InitDatabase(&ctx, cfg)
	if err != nil {
		log.Fatalf("failed to initialize database: %v\n", err)
	}
	defer db.Close(&ctx)

	var r = gin.Default()

	// middleware
	middleware.ApplyCors(r, cfg)

	// todo: add handlers here
	handlers.HealthCheck(r)

	r.Run(":" + cfg.Port)
}
