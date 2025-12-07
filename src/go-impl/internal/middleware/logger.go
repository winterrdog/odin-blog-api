package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

func ConfigureRequestLogger(r *gin.Engine) {
	var formatter = func(param gin.LogFormatterParams) string {
		return fmt.Sprintf(`{"time":"%s","status":%d,"method":"%s","path":"%s","latency":"%s","ip":"%s","user_agent":%q}`+"\n",
			param.TimeStamp.Format(time.RFC3339),
			param.StatusCode,
			param.Method,
			param.Path,
			param.Latency,
			param.ClientIP,
			param.Request.UserAgent(),
		)
	}
	r.Use(gin.LoggerWithFormatter(formatter))
}
