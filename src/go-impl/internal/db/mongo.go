package db

import (
	"context"
	"log"

	"github.com/qiniu/qmgo"
	"github.com/winterrdog/trie/internal/config"
	"github.com/winterrdog/trie/internal/models"
)

// Database represents the database connection and collections
type Database struct {
	Client       *qmgo.Client     // MongoDB client connection
	DB           *qmgo.Database   // Database instance
	Users        *qmgo.Collection // Users collection
	Posts        *qmgo.Collection // Posts collection
	Comments     *qmgo.Collection // Comments collection
	Interactions *qmgo.Collection // Interactions collection
}

func (db *Database) Close(ctx *context.Context) {
	db.Client.Close(*ctx)
	log.Println("+ successfully closed MongoDB connection!")
}

func InitDatabase(ctx *context.Context, cfg *config.Config) (*Database, error) {
	var client, err = qmgo.NewClient(*ctx, &qmgo.Config{Uri: cfg.MongoURI})
	if err != nil {
		return nil, err
	}

	var db = client.Database(cfg.DbName)
	var database = &Database{
		Client:       client,
		DB:           db,
		Users:        db.Collection("users"),
		Posts:        db.Collection("posts"),
		Comments:     db.Collection("comments"),
		Interactions: db.Collection("interactions"),
	}

	log.Println("+ successfully connected to MongoDB!")

	// create all indexes
	if err = models.CreateUserIndexes(ctx, database.Users); err != nil {
		return nil, err
	}
	if err = models.CreatePostIndexes(ctx, database.Posts); err != nil {
		return nil, err
	}
	if err = models.CreateCommentIndexes(ctx, database.Comments); err != nil {
		return nil, err
	}
	if err = models.CreateInteractionIndexes(ctx, database.Interactions); err != nil {
		return nil, err
	}

	log.Println("+ successfully created all db indexes!")

	return database, nil
}
