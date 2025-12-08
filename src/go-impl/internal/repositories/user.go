package repositories

import (
	"context"
	"errors"

	"github.com/qiniu/qmgo"
	"github.com/winterrdog/trie/internal/models"
	"github.com/winterrdog/trie/pkg/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type userRepository struct {
	coll *qmgo.Collection
}

type UserRepository interface {
	Create(ctx *context.Context, user *models.User) error
	Update(ctx *context.Context, filter bson.M, update models.UserUpdate) error
	FindOne(ctx *context.Context, filter bson.M) (*models.User, error)
	FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.User, error)
}

func NewUserRepository(coll *qmgo.Collection) UserRepository {
	return &userRepository{coll: coll}
}

func (r *userRepository) Create(ctx *context.Context, user *models.User) error {
	var _, err = r.coll.InsertOne(*ctx, user)
	return err
}

func (r *userRepository) FindOne(ctx *context.Context, filter bson.M) (*models.User, error) {
	var user models.User
	var err = r.coll.Find(*ctx, filter).One(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.User, error) {
	var users []models.User
	var err = r.coll.
		Find(*ctx, filter).
		Skip(int64(paginator.Offset())).
		Limit(int64(paginator.Limit())).
		All(&users)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return users, nil
}

func (r *userRepository) Update(ctx *context.Context, filter bson.M, update models.UserUpdate) error {
	var set = bson.M{}
	if update.Name != nil {
		set["name"] = *update.Name
	}
	if update.Email != nil {
		set["email"] = *update.Email
	}
	if update.Role != nil {
		set["role"] = *update.Role
	}
	if update.IsEmailVerified != nil {
		set["isEmailVerified"] = *update.IsEmailVerified
	}
	if update.IsActive != nil {
		set["isActive"] = *update.IsActive
	}
	if update.PasswordHash != nil {
		set["passwordHash"] = *update.PasswordHash
	}

	// no fields to update
	if len(set) == 0 {
		return nil
	}

	var updateDoc = bson.M{"$set": set}
	return r.coll.UpdateOne(*ctx, filter, updateDoc)
}
