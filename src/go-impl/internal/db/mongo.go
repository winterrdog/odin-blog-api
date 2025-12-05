package db

import (
	"context"
	"log"

	"github.com/qiniu/qmgo"
	"github.com/winterrdog/trie/internal/config"
)

func ConnectMongo(cfg *config.Config) *qmgo.Client {
	var client, err = qmgo.NewClient(context.Background(), &qmgo.Config{
		Uri: cfg.MongoURI,
	})

	if err != nil {
		log.Fatalf("failed to connect to the mongodb server: %s", err.Error())
	}

	return client
}
