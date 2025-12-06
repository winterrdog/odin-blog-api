FROM golang:1.25.5-alpine AS builder

WORKDIR /app

# install go dependencies
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# build the server
RUN go build -o bin/server ./cmd/server

FROM alpine:latest

RUN addgroup -g 1000 api && \
    adduser -D -u 1000 -G api api

WORKDIR /app

COPY --from=builder /app/bin/server .

RUN chown -R api:api /app

USER api

EXPOSE 8080

CMD ["./server"]
