#/usr/bin/env bash

# start containers via docker compose
# if docker-compose is not installed, use "docker compose up -d" instead
if ! command -v docker-compose &> /dev/null
then
    docker compose up -d
else
    docker-compose up -d
fi