package models

import (
	"context"
	"time"

	"github.com/qiniu/qmgo"
	"github.com/qiniu/qmgo/field"
	opts "github.com/qiniu/qmgo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
	field.DefaultField `bson:",inline"`

	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Author        primitive.ObjectID `bson:"author" json:"author"`
	AuthorName    string             `bson:"-" json:"authorName,omitempty"`
	Title         string             `bson:"title" json:"title"`
	Body          string             `bson:"body" json:"body"`
	Hidden        bool               `bson:"hidden" json:"hidden"`
	Deleted       bool               `bson:"deleted" json:"-"`
	DeletedAt     *time.Time         `bson:"deletedAt,omitempty" json:"-"`
	ViewsCount    int64              `bson:"viewsCount" json:"viewsCount"`
	LikesCount    int64              `bson:"likesCount" json:"likesCount"`
	DislikesCount int64              `bson:"dislikesCount" json:"dislikesCount"`
	CommentsCount int64              `bson:"commentsCount" json:"commentsCount"`
	CreatedAt     time.Time          `bson:"createdAt" json:"dateCreated"`
	UpdatedAt     time.Time          `bson:"updatedAt" json:"dateUpdated"`
}

func (p *Post) BeforeInsert(ctx context.Context) error {
	if p.ID.IsZero() {
		p.ID = primitive.NewObjectID()
	}

	now := time.Now()
	p.CreatedAt = now
	p.UpdatedAt = now

	return nil
}

func (p *Post) BeforeUpdate(ctx context.Context) error {
	now := time.Now()
	p.UpdatedAt = now
	return nil
}

func CreatePostIndexes(ctx *context.Context, coll *qmgo.Collection) error {
	var indexes = []opts.IndexModel{
		{Key: []string{"author"}},
		{Key: []string{"deleted", "hidden"}},
		{Key: []string{"-createdAt"}},
	}
	return coll.CreateIndexes(*ctx, indexes)
}
