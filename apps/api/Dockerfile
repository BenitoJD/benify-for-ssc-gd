FROM golang:1.24-alpine AS build
WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

COPY apps/api ./
RUN go test ./...
RUN go build -o /bin/benify-api ./cmd/server

FROM alpine:3.21
WORKDIR /app
RUN adduser -D -u 10001 benify
USER benify

COPY --from=build /bin/benify-api /app/benify-api
EXPOSE 8080

CMD ["/app/benify-api"]
