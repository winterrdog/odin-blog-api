package utils

const MAX_PAGE_SIZE = 12

// paginator describes a standard way to move through collections
type Paginator interface {
	Limit() int32
	Offset() int32
}

// simplePaginator is the default paginator used by the repo
type SimplePaginator struct {
	limit int32
	page  int32
}

// NewSimplePaginator creates and returns a new SimplePaginator instance with the given page and limit values.
// If page is less than 1, it defaults to 1.
// The limit is clamped between 1 and MAX_PAGE_SIZE to ensure valid pagination boundaries.
func NewSimplePaginator(page, limit int32) *SimplePaginator {
	if page < 1 {
		page = 1
	}

	return &SimplePaginator{
		page:  page,
		limit: ClampInt(limit, 1, MAX_PAGE_SIZE),
	}
}

func (p *SimplePaginator) Limit() int32 {
	return p.limit
}

func (p *SimplePaginator) Offset() int32 {
	return (p.page - 1) * p.limit
}
