package utils

import "github.com/gin-gonic/gin"

func Success(c *gin.Context, msg string, data any) {
	c.JSON(200, gin.H{"success": true, "data": data, "message": msg})
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"success": false, "message": msg})
}
