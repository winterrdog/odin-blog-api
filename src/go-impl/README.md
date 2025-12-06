# trie blog api

a blog api built with go, gin, and mongodb. supports posts, comments, threaded discussions, and user interactions like likes and dislikes.

## features

- user management with role-based access
- create and manage blog posts
- threaded comment system with parent-child relationships
- like/dislike interactions on posts and comments
- soft deletion for posts and comments

## data model

- users: authentication and profile data
- posts: blog content with author references
- comments: threaded discussions on posts
- interactions: likes/dislikes on posts and comments

### data model architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                    │
│  - ID (ObjectID)                                                │
│  - Name (unique)                                                │
│  - Email (unique)                                               │
│  - Role (default: RoleReader)                                   │
│  - CreatedAt, UpdatedAt                                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ (author)
             │
             ├──────────────────────────────────────────────────┐
             │                                                  │
             ▼                                                  ▼
┌────────────────────────────┐                    ┌──────────────────────────┐
│         POST               │                    │      INTERACTION         │
│  - ID (ObjectID)           │◄───────────────────│  - ID (ObjectID)         │
│  - Author (→ User)         │   (target)         │  - User (→ User)         │
│  - Content                 │                    │  - Target (→ Post/Comment)│
│  - Deleted, Hidden         │                    │  - TargetType            │
│  - CreatedAt, UpdatedAt    │                    │  - Type (like/dislike)   │
└────────────┬───────────────┘                    │  - CreatedAt, UpdatedAt  │
             │                                    │                          │
             │ (post)                             │  Unique: (user, target,  │
             │                                    │   targetType, type)      │
             ▼                                    └──────────────────────────┘
┌────────────────────────────┐                               ▲
│        COMMENT             │                               │
│  - ID (ObjectID)           │───────────────────────────────┘
│  - User (→ User)           │        (target)
│  - Post (→ Post)           │
│  - ParentComment (→ Comment) ◄──┐ (self-reference for threads)
│  - Content                 │    │
│  - Deleted                 │    │
│  - CreatedAt, UpdatedAt    │────┘
└────────────────────────────┘

```

## requirements

### with docker (recommended)

- docker
- docker compose

### without docker

- go `1.23` or higher
- mongodb `7.0` or higher

## setup

### 1. clone the repository

```bash
git clone <this-repo>
cd go-impl
```

### 2. create environment file

create a `.env` file at `cmd/server/.env`:

```bash
PORT=8080
DB_NAME=trie
MONGO_URI=mongodb://localhost:27017
```

> for docker, the MONGO_URI will be overridden automatically to use the container hostname.

### 3. run with docker

```bash
./run.sh
```

or manually:

```bash
docker compose up --build
```

the api will be available at `http://localhost:8080`

### 4. run without docker (optional)

> make sure mongodb is running locally, then:

```bash
go mod download
go build -o bin/server ./cmd/server
cd cmd/server && ../../bin/server
```

## project structure

```
go-impl/
├── cmd/
│   └── server/
│       ├── main.go          # application entry point
│       └── .env             # environment variables
├── internal/
│   ├── config/
│   │   └── config.go        # configuration loader
│   ├── db/
│   │   └── mongo.go         # database connection and setup
│   ├── models/
│   │   ├── user.go          # user model and indexes
│   │   ├── post.go          # post model and indexes
│   │   ├── comment.go       # comment model and indexes
│   │   └── interaction.go   # interaction model and indexes
│   └── utils/
│       └── response.go      # http response helpers
├── Dockerfile               # container image definition
├── docker compose.yml       # multi-container setup
└── run.sh                   # build and run script
```

## database indexes

the application automatically creates the following indexes on startup:

### users collection

- unique index on `name`
- unique index on `email`

### posts collection

- index on `author`
- compound index on `deleted` and `hidden`
- descending index on `createdAt`

### comments collection

- index on `user`
- index on `post`
- compound index on `post` and `parentComment` for thread queries
- compound index on `post` and `deleted` for filtering
- compound index on `post`, `parentComment`, and `-createdAt` for root comments

### interactions collection

- unique compound index on `user`, `target`, `targetType`, and `type`
- compound index on `user`, `target`, and `targetType`
- compound index on `target`, `targetType`, and `type`
- compound index on `user`, `type`, and `-createdAt` for activity feeds

## stopping the app

### with docker

```bash
docker compose down
```

to remove volumes as well:

```bash
docker compose down -v
```

### without docker

press `ctrl+c` in the terminal running the server.
