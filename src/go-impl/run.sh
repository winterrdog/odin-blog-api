#!/bin/sh

set -e

echo "+ setting up trie blog..."

# check if .env exists
if [ ! -f "cmd/server/.env" ]; then
    echo "error: .env file not found at cmd/server/.env"
    echo "please create it with the following variables:"
    echo "  PORT=8080"
    echo "  DB_NAME=your_db_name"
    exit 1
fi

echo "+ found .env file!"

# stop any running containers
echo "+ stopping existing containers..."
docker compose down

# build and start containers
echo "+ building and starting containers..."
docker compose up --build
