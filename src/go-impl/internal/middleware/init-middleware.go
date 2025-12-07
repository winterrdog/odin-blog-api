package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/winterrdog/trie/internal/config"
)

func ApplyAllMiddleware(r *gin.Engine, cfg *config.Config) {
	ConfigureRequestLogger(r)
	ApplyCors(r, cfg)
}
