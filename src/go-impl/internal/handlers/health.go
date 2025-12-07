package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/winterrdog/trie/pkg/utils"
)

// HealthCheck registers a GET /health route on the provided Gin engine.
// The route responds with a success payload ("OK") using utils.Success and is
// intended for liveness/health monitoring (e.g., uptime probes or load balancers).
// The provided engine must be non-nil.
func HealthCheck(r *gin.Engine) {
	r.GET("/health", func(ctx *gin.Context) {
		utils.Success(ctx, "OK", nil)
	})
}
