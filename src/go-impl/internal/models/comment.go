package models

import (
	"context"
	"time"

	"github.com/qiniu/qmgo"
	"github.com/qiniu/qmgo/field"
	opts "github.com/qiniu/qmgo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Comment struct {
	field.DefaultField `bson:",inline"` // we store flat docs

	ID            primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	User          primitive.ObjectID  `bson:"user" json:"user"`
	UserName      string              `bson:"-" json:"userName,omitempty"`
	Post          primitive.ObjectID  `bson:"post" json:"post"`
	ParentComment *primitive.ObjectID `bson:"parentComment,omitempty" json:"parentComment,omitempty"` // null for root comments
	Deleted       bool                `bson:"deleted" json:"-"`
	DeletedAt     *time.Time          `bson:"deletedAt,omitempty" json:"-"`
	Body          string              `bson:"body" json:"body"`
	TLDR          string              `bson:"tldr,omitempty" json:"tldr,omitempty"`
	LikesCount    int64               `bson:"likesCount" json:"likesCount"`
	DislikesCount int64               `bson:"dislikesCount" json:"dislikesCount"`
	CreatedAt     time.Time           `bson:"createdAt" json:"dateCreated"`
	UpdatedAt     time.Time           `bson:"updatedAt" json:"dateUpdated"`
}

func (c *Comment) BeforeInsert(ctx context.Context) error {
	if c.ID.IsZero() {
		c.ID = primitive.NewObjectID()
	}

	now := time.Now()
	c.CreatedAt = now
	c.UpdatedAt = now

	return nil
}

func (c *Comment) BeforeUpdate(ctx context.Context) error {
	now := time.Now()
	c.UpdatedAt = now

	return nil
}

// IsRootComment checks if this is a top-level comment
func (c *Comment) IsRootComment() bool {
	return c.ParentComment == nil
}

func CreateCommentIndexes(ctx context.Context, coll *qmgo.Collection) error {
	var indexes = []opts.IndexModel{
		{Key: []string{"user"}},
		{Key: []string{"post"}},
		{
			// Critical compound index for querying comment threads
			Key: []string{"post", "parentComment"},
		},
		{
			// For filtering deleted comments
			Key: []string{"post", "deleted"},
		},
		{
			// For querying root comments (where parentComment is null)
			Key: []string{"post", "parentComment", "-createdAt"},
		},
	}
	return coll.CreateIndexes(ctx, indexes)
}
