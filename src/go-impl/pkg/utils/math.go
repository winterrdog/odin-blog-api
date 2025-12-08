package utils

// ClampInt returns value constrained to the inclusive range [min, max].
// If value is less than min, min is returned. If value is greater than max,
// max is returned. Otherwise value is returned unchanged. The function works
// with int32 values and assumes min <= max; behavior is unspecified if min > max.
func ClampInt(value, min, max int32) int32 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}
