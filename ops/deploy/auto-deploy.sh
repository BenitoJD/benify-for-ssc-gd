#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/olli-for-ssc-gd}"

if [[ ! -d "$REPO_DIR" ]]; then
  echo "Repository directory not found: $REPO_DIR" >&2
  exit 1
fi
BRANCH="${BRANCH:-main}"
ENV_FILE="${ENV_FILE:-$REPO_DIR/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO_DIR/docker-compose.prod.yml}"
GHCR_OWNER="${GHCR_OWNER:-benitojd}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

cd "$REPO_DIR"

git fetch origin "$BRANCH"

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse "origin/$BRANCH")"

if [[ "$LOCAL_SHA" == "$REMOTE_SHA" ]]; then
  echo "No new commit to deploy."
  exit 0
fi

git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

export GHCR_OWNER
export IMAGE_TAG

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull web api
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans
docker image prune -f
