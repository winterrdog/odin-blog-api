package repositories

import (
	"context"
	"errors"

	"github.com/qiniu/qmgo"
	"github.com/winterrdog/trie/internal/models"
	"github.com/winterrdog/trie/pkg/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type interactionRepository struct {
	coll        *qmgo.Collection
	postRepo    PostRepository
	commentRepo CommentRepository
}

// InteractionRepository handles interaction data operations
type InteractionRepository interface {
	Create(ctx *context.Context, interaction *models.Interaction) error
	FindOne(ctx *context.Context, filter bson.M) (*models.Interaction, error)
	FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.Interaction, error)
	Delete(ctx *context.Context, filter bson.M) error
	Upsert(ctx *context.Context, interaction *models.Interaction) error
}

// NewInteractionRepository creates a new interaction repository instance
func NewInteractionRepository(coll *qmgo.Collection, postRepo PostRepository, commentRepo CommentRepository) InteractionRepository {
	return &interactionRepository{
		coll:        coll,
		postRepo:    postRepo,
		commentRepo: commentRepo,
	}
}

func (repo *interactionRepository) Create(ctx *context.Context, interaction *models.Interaction) error {
	var _, err = repo.coll.InsertOne(*ctx, interaction)
	if err != nil {
		return err
	}

	// update target count atomically
	return repo.updateTargetCount(ctx, interaction, 1)
}

func (repo *interactionRepository) FindOne(ctx *context.Context, filter bson.M) (*models.Interaction, error) {
	var interaction models.Interaction
	var err = repo.coll.Find(*ctx, filter).One(&interaction)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &interaction, nil
}

func (repo *interactionRepository) FindAll(ctx *context.Context, filter bson.M, paginator utils.Paginator) ([]models.Interaction, error) {
	var interactions []models.Interaction
	var err = repo.coll.
		Find(*ctx, filter).
		Skip(int64(paginator.Offset())).
		Limit(int64(paginator.Limit())).
		Sort("-createdAt").
		All(&interactions)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return interactions, nil
}

func (repo *interactionRepository) Delete(ctx *context.Context, filter bson.M) error {
	// find the interaction first to update counts
	var interaction, err = repo.FindOne(ctx, filter)
	if err != nil {
		return err
	}
	if interaction == nil {
		return nil
	}

	err = repo.coll.Remove(*ctx, filter)
	if err != nil {
		return err
	}

	// decrement target count atomically
	return repo.updateTargetCount(ctx, interaction, -1)
}

// Upsert creates or updates an interaction and handles count updates atomically
func (repo *interactionRepository) Upsert(ctx *context.Context, interaction *models.Interaction) error {
	var filter = bson.M{
		"user":       interaction.User,
		"target":     interaction.Target,
		"targetType": interaction.TargetType,
	}

	var existing, err = repo.FindOne(ctx, filter)
	if err != nil {
		return err
	}

	// no existing interaction, create new one
	if existing == nil {
		return repo.Create(ctx, interaction)
	}

	// same type, no change needed
	if existing.Type == interaction.Type {
		return nil
	}

	// different type, update the interaction and adjust counts
	var updateDoc = bson.M{
		"$set": bson.M{
			"type": interaction.Type,
		},
	}
	err = repo.coll.UpdateOne(*ctx, filter, updateDoc)
	if err != nil {
		return err
	}

	// decrement old type count
	err = repo.updateTargetCountByType(ctx, existing.Target, existing.TargetType, existing.Type, -1)
	if err != nil {
		return err
	}

	// increment new type count
	return repo.updateTargetCountByType(ctx, interaction.Target, interaction.TargetType, interaction.Type, 1)
}

// updateTargetCount updates the count on the target entity based on interaction type
func (repo *interactionRepository) updateTargetCount(ctx *context.Context, interaction *models.Interaction, delta int64) error {
	return repo.updateTargetCountByType(ctx, interaction.Target, interaction.TargetType, interaction.Type, delta)
}

// updateTargetCountByType updates a specific count field on the target entity
func (repo *interactionRepository) updateTargetCountByType(ctx *context.Context, targetID primitive.ObjectID, targetType models.TargetType, interactionType models.InteractionType, delta int64) error {
	var field = getCountField(interactionType)
	if field == "" {
		return nil
	}

	var filter = bson.M{"_id": targetID}
	if targetType == models.TargetPost {
		return repo.postRepo.IncrementCount(ctx, filter, field, delta)
	}
	if targetType == models.TargetComment {
		return repo.commentRepo.IncrementCount(ctx, filter, field, delta)
	}

	return nil
}

// getCountField maps interaction type to the count field name
func getCountField(interactionType models.InteractionType) string {
	switch interactionType {
	case models.InteractionLike:
		return "likesCount"
	case models.InteractionDislike:
		return "dislikesCount"
	case models.InteractionView:
		return "viewsCount"
	default:
		return ""
	}
}
