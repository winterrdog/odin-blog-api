package utils

import "github.com/gin-gonic/gin"

// Success sends a successful JSON response to the client with the provided message and data.
// It returns an HTTP 200 status code along with a success flag set to true.
//
// Parameters:
//   - c: The Gin context used to write the HTTP response
//   - msg: A message string to include in the response
//   - data: Any data to be serialized and included in the response body
func Success(c *gin.Context, msg string, data any) {
	c.JSON(200, gin.H{"success": true, "data": data, "message": msg})
}

// Error sends a JSON error response to the client with the specified HTTP status code and message.
// It sets the success field to false and includes the provided error message.
//
// Parameters:
//   - c: the Gin context for the current request
//   - code: the HTTP status code to return (e.g., 400, 404, 500)
//   - msg: the error message to include in the response
func Error(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"success": false, "message": msg})
}
