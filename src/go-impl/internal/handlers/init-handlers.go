package handlers

import "github.com/gin-gonic/gin"

func AttachAllHandlers(r *gin.Engine) {
	HealthCheck(r)
}
