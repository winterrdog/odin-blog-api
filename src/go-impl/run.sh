#!/bin/bash

set -e

COMPOSE_FILE="docker-compose.yml"

check_env() {
    if [ ! -f "cmd/server/.env" ]; then
        echo "error: .env file not found at cmd/server/.env"
        echo "please create it with the following variables:"
        echo "  PORT=8080"
        echo "  DB_NAME=trie"
        echo "  ENV=development"
        echo "  FRONTEND_URL=http://localhost:5000"
        echo "  MONGO_URI=mongodb://mongodb:27017/trie"
        exit 1
    fi
    echo "+ found .env file!"
}

cmd_start() {
    check_env
    echo "+ building and starting containers in detached mode..."
    docker compose -f "$COMPOSE_FILE" up --build -d
    echo -e "\n+ trie blog restarted. api available at http://localhost:${PORT:-8080}"
}

cmd_restart() {
    check_env
    echo "+ restarting trie blog..."
    docker compose -f "$COMPOSE_FILE" down
    echo "+ building and starting containers in detached mode..."
    docker compose -f "$COMPOSE_FILE" up --build -d
    echo -e "\n+ trie blog restarted. api available at http://localhost:${PORT:-8080}"
}

cmd_stop() {
    echo "+ stopping trie blog..."
    docker compose -f "$COMPOSE_FILE" down
    echo "+ containers stopped."
}

cmd_logs() {
    echo -e "+ tailing logs (ctrl+c to exit)...\n"
    docker compose -f "$COMPOSE_FILE" logs -f  api
}

usage() {
    cat <<EOF
usage: ./run.sh [command]

commands:
  start       build and start containers in detached mode (default)
  restart     stop and restart containers in detached mode
  stop        stop running containers
  logs        tail logs from running containers
  help        show this help message

requirements:
  - docker
  - docker compose
  - cmd/server/.env file with the following variables:
      PORT=8080
      DB_NAME=trie
      ENV=development
      FRONTEND_URL=http://localhost:5000
      MONGO_URI=mongodb://mongodb:27017/trie

examples:
  ./run.sh            # start in detached mode (default)
  ./run.sh start      # start in detached mode
  ./run.sh restart    # restart containers
  ./run.sh stop       # stop containers
  ./run.sh logs       # tail container logs
EOF
}

# default to "start" if no argument is provided
COMMAND="${1:-start}"

case "$COMMAND" in
    start)   cmd_start ;;
    restart) cmd_restart ;;
    stop)    cmd_stop ;;
    logs)    cmd_logs ;;
    help|--help|-h) usage ;;
    *)
        echo "error: unknown command '$COMMAND'"
        echo ""
        usage
        exit 1
        ;;
esac
