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

type postRepository struct {
	coll *qmgo.Collection
}

// PostRepository handles post data operations
type PostRepository interface {
	Create(ctx *context.Context, post *models.Post) error
	Update(ctx *context.Context, filter bson.M, update models.PostUpdate) error
	FindOne(ctx *context.Context, filter bson.M) (*models.Post, error)
	FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.Post, error)
	Delete(ctx *context.Context, filter bson.M) error
	IncrementCount(ctx *context.Context, filter bson.M, field string, delta int64) error
}

// NewPostRepository creates a new post repository instance
func NewPostRepository(coll *qmgo.Collection) PostRepository {
	return &postRepository{coll: coll}
}

func (r *postRepository) Create(ctx *context.Context, post *models.Post) error {
	var _, err = r.coll.InsertOne(*ctx, post)
	return err
}

func (r *postRepository) FindOne(ctx *context.Context, filter bson.M) (*models.Post, error) {
	var post models.Post
	var err = r.coll.Find(*ctx, filter).One(&post)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &post, nil
}

func (r *postRepository) FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.Post, error) {
	var posts []models.Post
	var err = r.coll.
		Find(*ctx, filter).
		Skip(int64(paginator.Offset())).
		Limit(int64(paginator.Limit())).
		Sort("-createdAt").
		All(&posts)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return posts, nil
}

func (r *postRepository) Update(ctx *context.Context, filter bson.M, update models.PostUpdate) error {
	var set = bson.M{}
	if update.Title != nil {
		set["title"] = *update.Title
	}
	if update.Body != nil {
		set["body"] = *update.Body
	}
	if update.Hidden != nil {
		set["hidden"] = *update.Hidden
	}

	// no fields to update
	if len(set) == 0 {
		return nil
	}

	var updateDoc = bson.M{"$set": set}
	return r.coll.UpdateOne(*ctx, filter, updateDoc)
}

// Delete performs a soft delete by setting deleted flag and timestamp
func (r *postRepository) Delete(ctx *context.Context, filter bson.M) error {
	var now = bson.M{
		"deleted":   true,
		"deletedAt": bson.M{"$currentDate": true},
	}
	var updateDoc = bson.M{"$set": now}
	return r.coll.UpdateOne(*ctx, filter, updateDoc)
}

// IncrementCount atomically increments a counter field on a post
func (r *postRepository) IncrementCount(ctx *context.Context, filter bson.M, field string, delta int64) error {
	// apply validation on field name if necessary
	var allowedFields = map[string]bool{
		"viewsCount":    true,
		"likesCount":    true,
		"dislikesCount": true,
		"commentsCount": true,
	}

	if !allowedFields[field] {
		return errors.New("invalid field for increment:" + field)
	}

	var updateDoc = bson.M{"$inc": bson.M{field: delta}}
	return r.coll.UpdateOne(*ctx, filter, updateDoc)
}
