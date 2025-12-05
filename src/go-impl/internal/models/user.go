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

const (
	RoleAuthor string = "author"
	RoleReader string = "reader"
)

type User struct {
	field.DefaultField `bson:",inline"`

	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name            string             `bson:"name" json:"name"`
	Email           string             `bson:"email" json:"email"`
	PasswordHash    string             `bson:"passwordHash" json:"-"`
	Role            string             `bson:"role" json:"role"`
	IsActive        bool               `bson:"isActive" json:"isActive"`
	IsEmailVerified bool               `bson:"isEmailVerified" json:"isEmailVerified"`
	CreatedAt       time.Time          `bson:"createdAt" json:"dateCreated"`
	UpdatedAt       time.Time          `bson:"updatedAt" json:"dateUpdated"`
}

// hook called before inserting
func (u *User) BeforeInsert(ctx context.Context) error {
	if u.ID.IsZero() {
		u.ID = primitive.NewObjectID()
	}

	now := time.Now()
	u.CreatedAt = now
	u.UpdatedAt = now
	if u.Role == "" {
		u.Role = RoleReader
	}

	return nil
}

// hook called before updating
func (u *User) BeforeUpdate(ctx context.Context) error {
	u.UpdatedAt = time.Now()
	return nil
}

// CreateUserIndexes creates all indexes for the User collection
func CreateUserIndexes(ctx context.Context, coll *qmgo.Collection) error {
	var unique = true
	var indexes = []opts.IndexModel{
		{
			Key:          []string{"name"},
			IndexOptions: &options.IndexOptions{Unique: &unique},
		},
		{
			Key:          []string{"email"},
			IndexOptions: &options.IndexOptions{Unique: &unique},
		},
	}
	return coll.CreateIndexes(ctx, indexes)
}
