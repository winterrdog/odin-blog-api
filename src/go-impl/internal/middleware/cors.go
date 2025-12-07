package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/winterrdog/trie/internal/config"
)

func ApplyCors(router *gin.Engine, cfg *config.Config) {
	router.Use(
		cors.New(cors.Config{
			AllowCredentials: true,
			MaxAge:           99 * time.Hour,
			AllowOrigins:     []string{cfg.FrontendURL},
			ExposeHeaders:    []string{"Content-Length"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		}),
	)
}
