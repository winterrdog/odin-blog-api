# odin-blog-api

An exercise by The Odin Project( TOP ) to create a blog. I only designed the backend as that's my speciality :), then [_@muchubatactics_](https://github.com/muchubatactics) did the frontend. The backend is a `REST`ful API built with `Node.js`, `Express.js`, `MongoDB`, and `JWT` for authorization. It has `16+` endpoints for creating, reading, updating, and deleting users, posts, comments, and replies.

**AUTHORS**: [_winterrdog_](https://github.com/winterrdog) & [_muchubatactics_](https://github.com/muchubatactics)

## REQUIREMENTS

Make sure you have the following installed:

- `Postman` / `curl` - _for testing the API_
- `Docker` - _for building the database(`mongodb`) and the application_
- `Docker Compose` - _for deploying the application_

## RUNNING BACKEND

- To set up the environment variables, create a `.env` file in the root directory and copy the contents of `.env.example` into it. Then fill in the missing values.

- To run the backend, run the following command:

  ```bash
  cd ./src
  ./containerize.sh
  ```

- In case you want to run it in development mode, run the following command( for backend dev only ):

  ```bash
  docker-compose -f ./docker-compose-dev.yml up -d
  ```

- Stop the backend by running the following command:

  ```bash
  docker-compose down
  ```

- The backend will be available at `http://localhost:3000`.

## VIEWING THE LOGS

- To view logs, run the following command:

  ```bash
  docker-compose logs -f
  ```

- The container will also write logs to `./src/blog-app.log` external to the container.

## API DOCUMENTATION

This backend has 3 features:

- `Authentication` - _for creating, deleting, updating and logging in users_
- `Posts` - _for creating, reading, updating and deleting posts_
- `Comments` - _for creating, reading, updating and deleting comments_

It has `16+` endpoints i.e.:

### User Endpoints

- `POST /api/v1/users/sign-up` - _for registering a user_
- `POST /api/v1/users/sign-in` - _for logging in a user_
- `PATCH /api/v1/users/update` - _for updating a user details_
- `DELETE /api/v1/users/delete` - _for deleting a user_

### Post Endpoints

- `POST /api/v1/posts/` - _for creating a post_
- `GET /api/v1/posts/` - _for getting all posts_
- `GET /api/v1/posts/:postId` - _for getting a post_
- `PATCH /api/v1/posts/:postId` - _for updating a post_
- `DELETE /api/v1/posts/:postId` - _for deleting a post_
- `PATCH /api/v1/posts/:postId/likes` - _for adding a like_
- `PATCH /api/v1/posts/:postId/dislikes` - _for adding a dislike_

### Comment Endpoints

- `POST /api/v1/post-comments/:postId/comments/` - _for creating a comment_
- `GET /api/v1/post-comments/:postId/comments/` - _for getting all comments for a post_
- `GET /api/v1/post-comments/:postId/comments/:commentId` - _for getting a comment_
- `PATCH /api/v1/post-comments/:postId/comments/:commentId` - _for updating a comment_
- `DELETE /api/v1/post-comments/:postId/comments/:commentId` - _for deleting a comment_
- `PATCH /api/v1/post-comments/:postId/comments/:commentId/likes` - _for adding a like_
- `DELETE /api/v1/post-comments/:postId/comments/:commentId/likes` - _for removing a like_
- `PATCH /api/v1/post-comments/:postId/comments/:commentId/dislikes` - _for adding a dislike_
- `DELETE /api/v1/post-comments/:postId/comments/:commentId/dislikes` - _for removing a dislike_
- `POST /api/v1/post-comments/:postId/comments/:commentId/replies` - _for creating a reply_
- `PATCH /api/v1/post-comments/:postId/comments/:commentId/replies` - _for adding a reply_
- `DELETE /api/v1/post-comments/:postId/comments/:commentId/replies/:replyId` - _for deleting a reply_

### AUTHENTICATION

- The API uses `JWT` for authentication. The JWT is required in the `Authorization` header for **all** requests except for `sign-up` and `sign-in` requests and for user actions that only require reading data from the server i.e `GET` requests.

## SAMPLE REQUESTS

- To test the API, you can use `Postman` or `curl`. Below are some sample requests:

### User Requests

#### Sign up a user

```sh
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "John Doe",
    "pass": "password",
    "role": "author"
}' http://localhost:3000/api/v1/users/sign-up
```

The server will respond with:

```json
HTTP/1.1 201 Created

{
    "message": "User created successfully",
    "token": "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4"
}
```

#### Sign in a user

```sh
curl -X POST -H "Content-Type: application/json" -d '{"name": "John Doe", "pass": "password"}' http://localhost:3000/api/v1/users/sign-in
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "User signed in successfully",
    "token": "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4"
}
```

#### Update a user's details

```sh
curl -X PATCH -H "Content-Type: application/json" -d '{"name": "Jane Doe", "role": "reader"}' http://localhost:3000/api/v1/users/update
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
  "message": "User updated",
  "user": {
    "name": "Jane Doe",
    "role": "reader",
    "id": "6623cfc033d53b054fe9b0c3",
    "dateCreated": "2024-04-20T14:22:56.517Z",
    "dateUpdated": "2024-04-22T12:29:46.406Z"
  }
}
```

#### Delete a user

```sh
curl -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" http://localhost:3000/api/v1/users/delete
```

The server will respond with:

```json
    HTTP/1.1 204 No Content
```

### Post Requests

#### Create a post.

Only registered users can create posts. The JWT is required in the Authorization header.

```sh
curl -X POST -H "Content-Type: application/json" -H "
Authorization: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" -d '{
    "title": "My first post",
    "body": "This is my first post. I hope you like it."
}' http://localhost:3000/api/v1/posts/
```

The server will respond with:

```json
HTTP/1.1 201 Created

{
  "message": "Post created successfully",
  "post": {
    "author": "John Doe",
    "title": "My first post",
    "body": "This is my first post. I hope you like it.",
    "hidden": false,
    "id": "662659aaa2e291b846358a06",
    "dateCreated": "2024-04-22T12:35:54.030Z",
    "dateUpdated": "2024-04-22T12:35:54.030Z"
  }
}
```

#### Get all posts

```sh
curl -X GET http://localhost:3000/api/v1/posts/
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "Posts retrieved successfully",
    "posts": [
        {
            "author": "John Doe",
            "title": "My first post",
            "body": "This is my first post. I hope you like it.",
            "hidden": false,
            "id": "662659aaa2e291b846358a06",
            "dateCreated": "2024-04-22T12:35:54.030Z",
            "dateUpdated": "2024-04-22T12:35:54.030Z"
        },
        {
            "author": "Jane Doe",
            "title": "My second post",
            "body": "This is my second post. I hope you like it.",
            "hidden": false,
            "id": "662659aaa2e291b846358a07",
            "dateCreated": "2024-04-22T12:35:54.030Z",
            "dateUpdated": "2024-04-22T12:35:54.030Z"
        }
    ]
}
```

#### Get a post

```sh
curl -X GET http://localhost:3000/api/v1/posts/662659aaa2e291b846358a06
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "Post retrieved successfully",
    "post": {
        "author": "John Doe",
        "title": "My first post",
        "body": "This is my first post. I hope you like it.",
        "hidden": false,
        "id": "662659aaa2e291b846358a06",
        "dateCreated": "2024-04-22T12:35:54.030Z",
        "dateUpdated": "2024-04-22T12:35:54.030Z"
    }
}
```

#### Update a post

```sh
curl -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" -d '{
    "title": "My first post",
    "body": "This is my first post. I hope you like it. I have updated it."
}' http://localhost:3000/api/v1/posts/662659aaa2e291b846358a06
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "Post updated",
    "post": {
        "author": "John Doe",
        "title": "My first post",
        "body": "This is my first post. I hope you like it. I have updated it.",
        "hidden": false,
        "id": "662659aaa2e291b846358a06",
        "dateCreated": "2024-04-22T12:35:54.030Z",
        "dateUpdated": "2024-04-22T12:35:54.030Z"
    }
}
```

#### Delete a post

```sh
curl -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" http://localhost:3000/api/v1/posts/662659aaa2e291b846358a06
```

The server will respond with:

```json
HTTP/1.1 204 No Content
```

### Comment Requests

#### Create a comment.

Only registered users can create comments. The JWT is required in the Authorization header.

```sh
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" -d '{
    "body": "This is a great post. I love it."
}' http://localhost:3000/api/v1/post-comments/662659aaa2e291b846358a07/comments/
```

The server will respond with:

```json
HTTP/1.1 201 Created

{
  "message": "comment created successfully",
  "comment": {
    "body": "how does it work?",
    "tldr": "work",
    "user": "kaboom",
    "post": "6623d00e33d53b054fe9b0c7",
    "id": "66265bcda2e291b846358a17",
    "dateCreated": "2024-04-22T12:45:01.875Z",
    "dateUpdated": "2024-04-22T12:45:01.875Z"
  }
}
```

#### Get all comments for a post

```sh
curl -X GET http://localhost:3000/api/v1/post-comments/662659aaa2e291b846358a07/comments/
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "post comments fetched successfully",
    "comments": [
        {
            "body": "This is a great post. I love it.",
            "tldr": "great post",
            "user": "John Doe",
            "post": "662659aaa2e291b846358a07",
            "id": "66265bcda2e291b846358a17",
            "dateCreated": "2024-04-22T12:45:01.875Z",
            "dateUpdated": "2024-04-22T12:45:01.875Z"
        }
    ]
}
```

#### Get a comment

```sh
curl -X GET http://localhost:3000/api/v1/post-comments/662659aaa2e291b846358a07/comments/66265bcda2e291b846358a17
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "comment fetched successfully",
    "comment": {
        "body": "This is a great post. I love it.",
        "tldr": "great post",
        "user": "John Doe",
        "post": "662659aaa2e291b846358a07",
        "id": "66265bcda2e291b846358a17",
        "dateCreated": "2024-04-22T12:45:01.875Z",
        "dateUpdated": "2024-04-22T12:45:01.875Z"
    }
}
```

#### Update a comment

```sh
curl -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" -d '{
    "body": "This is a great post. I love it. I have updated it."
}' http://localhost:3000/api/v1/post-comments/662659aaa2e291b846358a07/comments/66265bcda2e291b846358a17
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "post comment updated successfully",
    "comment": {
        "body": "This is a great post. I love it. I have updated it.",
        "tldr": "great post",
        "user": "John Doe",
        "post": "662659aaa2e291b846358a07",
        "id": "66265bcda2e291b846358a17",
        "dateCreated": "2024-04-22T12:45:01.875Z",
        "dateUpdated": "2024-04-22T12:45:01.875Z"
    }
}
```

#### Delete a comment

```sh
curl -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" http://localhost:3000/api/v1/post-comments/662659aaa2e291b846358a07/comments/66265bcda2e291b846358a17
```

The server will respond with:

```json
HTTP/1.1 204 No Content
```

#### Add a like to a comment

```sh
curl -X PATCH
-H "Authorization
: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" http://localhost:3000/api/v1/post-comments/662659aaa2e291b846358a07/comments/66265bcda2e291b846358a17/likes
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "like added successfully",
    "comment": {
        "body": "This is a great post. I love it. I have updated it.",
        "tldr": "great post",
        "user": "John Doe",
        "post": "662659aaa2e291b846358a07",
        "id": "66265bcda2e291b846358a17",
        "dateCreated": "2024-04-22T12:45:01.875Z",
        "dateUpdated": "2024-04-22T12:45:01.875Z",
        "likes": 1,
        "dislikes": 0
    }
}
```

#### Remove a like from a comment

```sh
curl -X DELETE
-H "Authorization
: Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6IjY2MjY1NWMxYTJlMjkxYjg0NjM1ODlmZSIsInJvbGUiOiJhdXRob3IifSwiaWF0IjoxNzEzNzg4MzUzLCJleHAiOjE3MTM5NjExNTN9.8oc3DOAR6SqaWUBynMZlAvHJr202cTXbtiq80EVyO5RSXMJrdGJ-aWdZF_lfR1p4" http://localhost:3000/api/v1/post-comments/662659aaa2e291b846358a07/comments/66265bcda2e291b846358a17/likes
```

The server will respond with:

```json
HTTP/1.1 200 OK

{
    "message": "like removed successfully",
    "comment": {
        "body": "This is a great post. I love it. I have updated it.",
        "tldr": "great post",
        "user": "John Doe",
        "post": "662659aaa2e291b846358a07",
        "id": "66265bcda2e291b846358a17",
        "dateCreated": "2024-04-22T12:45:01.875Z",
        "dateUpdated": "2024-04-22T12:45:01.875Z",
        "likes": 0,
        "dislikes": 0
    }
}
```

#### DISLIKES

They follow the same pattern as likes. The only difference is that they are for disliking a comment. The endpoints change from `likes` to `dislikes` but the method remains the same.

#### REPLIES

They follow the same pattern as comments. The only difference is that they are nested under comments.

LICENSE: [Unlicense](https://unlicense.org)
