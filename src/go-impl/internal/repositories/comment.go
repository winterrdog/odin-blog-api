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

type commentRepository struct {
	coll     *qmgo.Collection
	postRepo PostRepository
}

// CommentRepository handles comment data operations
type CommentRepository interface {
	Create(ctx *context.Context, comment *models.Comment) error
	Update(ctx *context.Context, filter bson.M, update models.CommentUpdate) error
	FindOne(ctx *context.Context, filter bson.M) (*models.Comment, error)
	FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.Comment, error)
	Delete(ctx *context.Context, filter bson.M) error
	IncrementCount(ctx *context.Context, filter bson.M, field string, delta int64) error
}

// NewCommentRepository creates a new comment repository instance
func NewCommentRepository(coll *qmgo.Collection, postRepo PostRepository) CommentRepository {
	return &commentRepository{
		coll:     coll,
		postRepo: postRepo,
	}
}

func (r *commentRepository) Create(ctx *context.Context, comment *models.Comment) error {
	var _, err = r.coll.InsertOne(*ctx, comment)
	if err != nil {
		return err
	}

	// increment post comment count atomically
	var filter = bson.M{"_id": comment.Post}
	return r.postRepo.IncrementCount(ctx, filter, "commentsCount", 1)
}

func (r *commentRepository) FindOne(ctx *context.Context, filter bson.M) (*models.Comment, error) {
	var comment models.Comment
	var err = r.coll.Find(*ctx, filter).One(&comment)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &comment, nil
}

func (r *commentRepository) FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.Comment, error) {
	var comments []models.Comment
	var err = r.coll.
		Find(*ctx, filter).
		Skip(int64(paginator.Offset())).
		Limit(int64(paginator.Limit())).
		Sort("-createdAt").
		All(&comments)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return comments, nil
}

func (r *commentRepository) Update(ctx *context.Context, filter bson.M, update models.CommentUpdate) error {
	var set = bson.M{}
	if update.Body != nil {
		set["body"] = *update.Body
	}
	if update.TLDR != nil {
		set["tldr"] = *update.TLDR
	}

	// no fields to update
	if len(set) == 0 {
		return nil
	}

	var updateDoc = bson.M{"$set": set}
	return r.coll.UpdateOne(*ctx, filter, updateDoc)
}

// Delete performs a soft delete by setting deleted flag and timestamp
func (r *commentRepository) Delete(ctx *context.Context, filter bson.M) error {
	// find the comment first to get post id
	var comment, err = r.FindOne(ctx, filter)
	if err != nil {
		return err
	}
	if comment == nil {
		return nil
	}

	var now = bson.M{
		"deleted":   true,
		"deletedAt": bson.M{"$currentDate": true},
	}
	var updateDoc = bson.M{"$set": now}
	err = r.coll.UpdateOne(*ctx, filter, updateDoc)
	if err != nil {
		return err
	}

	// decrement post comment count atomically
	var postFilter = bson.M{"_id": comment.Post}
	return r.postRepo.IncrementCount(ctx, postFilter, "commentsCount", -1)
}

// IncrementCount atomically increments a counter field on a comment
func (r *commentRepository) IncrementCount(ctx *context.Context, filter bson.M, field string, delta int64) error {
	var updateDoc = bson.M{"$inc": bson.M{field: delta}}
	return r.coll.UpdateOne(*ctx, filter, updateDoc)
}
