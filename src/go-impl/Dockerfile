# #############
# Build stage
# #############

FROM golang:1.26.2-alpine AS builder

WORKDIR /app

# install go dependencies
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# build the server
# RUN go build -v -ldflags="-s -w -O2" -o bin/server ./cmd/server # has optimisation on but slower build time, good for production
RUN go build -v -o bin/server ./cmd/server

# ############
# Final stage
# ############

FROM alpine:latest AS final

RUN addgroup -g 1000 api && \
    adduser -D -u 1000 -G api api

WORKDIR /app

COPY --from=builder /app/bin/server .

RUN chown -R api:api /app

USER api

EXPOSE 8080

CMD ["./server"]
