package models

import (
	"context"
	"time"

	"github.com/qiniu/qmgo"
	"github.com/qiniu/qmgo/field"
	opts "github.com/qiniu/qmgo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type TargetType string
type InteractionType string

const (
	InteractionLike    InteractionType = "like"
	InteractionDislike InteractionType = "dislike"
	InteractionView    InteractionType = "view"

	TargetPost    TargetType = "Post"
	TargetComment TargetType = "Comment"
)

type Interaction struct {
	field.DefaultField `bson:",inline"`

	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	User       primitive.ObjectID `bson:"user" json:"user"`
	Target     primitive.ObjectID `bson:"target" json:"target"`
	TargetType TargetType         `bson:"targetType" json:"targetType"`
	Type       InteractionType    `bson:"type" json:"type"`
	CreatedAt  time.Time          `bson:"createdAt" json:"dateCreated"`
	UpdatedAt  time.Time          `bson:"updatedAt" json:"dateUpdated"`
}

func (i *Interaction) BeforeInsert(ctx context.Context) error {
	if i.ID.IsZero() {
		i.ID = primitive.NewObjectID()
	}

	now := time.Now()
	i.CreatedAt = now
	i.UpdatedAt = now
	return nil
}

func CreateInteractionIndexes(ctx *context.Context, coll *qmgo.Collection) error {
	var unique = true
	var indexes = []opts.IndexModel{
		{
			// Unique constraint: user can only have one interaction type per target
			Key:          []string{"user", "target", "targetType", "type"},
			IndexOptions: &options.IndexOptions{Unique: &unique},
		},
		{
			// for checking if user has liked/disliked something
			Key: []string{"user", "target", "targetType"},
		},
		{
			// for counting likes/dislikes on a target
			Key: []string{"target", "targetType", "type"},
		},
		{
			// for getting all interactions by a user (activity feed)
			Key: []string{"user", "type", "-createdAt"},
		},
	}
	return coll.CreateIndexes(*ctx, indexes)
}
