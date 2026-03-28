#!/usr/bin/env bash
set -euo pipefail

# --- Settings ---
APP_DIR="/opt/despesago"
PARENT_DIR="$(dirname "$APP_DIR")"
REPO_URL="https://github.com/cesarpsalves/despesago.git"
BRANCH="main"

# Environment file
ENV_SOURCE="/opt/.env.despesago"
ENV_TARGET=".env"

# Docker Compose
PROJECT_NAME="despesago"
COMPOSE_FILE="docker-compose.yml"

ts() { date +'%Y-%m-%d %H:%M:%S'; }

echo "[$(ts)] Starting deploy at $APP_DIR (branch: $BRANCH)"

# --- Traefik network ---
docker network inspect traefik-public >/dev/null 2>&1 || docker network create traefik-public

# --- Bring down current stack before removing code ---
if [[ -f "$APP_DIR/$COMPOSE_FILE" ]]; then
  echo "- Bringing down current stack ($PROJECT_NAME)"
  docker compose -p "$PROJECT_NAME" -f "$APP_DIR/$COMPOSE_FILE" down --remove-orphans || true
fi

# --- Make sure we are not inside the directory ---
cd "$PARENT_DIR"

# --- Remove old version ---
echo "- Removing old directory ($APP_DIR)"
rm -rf "$APP_DIR"

# --- Clone project ---
echo "- Cloning $REPO_URL"
git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"

# --- Enter project directory ---
cd "$APP_DIR"

# --- Copy .env ---
if [[ ! -f "$ENV_SOURCE" ]]; then
  echo "ERROR: Environment file not found at $ENV_SOURCE" >&2
  exit 1
fi

echo "- Copying environment file to $APP_DIR/$ENV_TARGET"
cp "$ENV_SOURCE" "$APP_DIR/$ENV_TARGET"

# --- Generate version.txt ---
COMMIT_SHA="$(git rev-parse --short HEAD)"
cat <<EOF > version.txt
commit=${COMMIT_SHA}
built_at=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
deploy_time=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
EOF

export COMMIT_SHA

# --- Build all services ---
echo "- Building all services"
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" build --no-cache

# --- Start all services ---
echo "- Starting all services"
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d --force-recreate --remove-orphans

echo "[$(ts)] Deploy completed successfully!"

# --- Status ---
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps

# --- Light cleanup ---
docker image prune -f >/dev/null 2>&1 || true
docker volume prune -f >/dev/null 2>&1 || true

echo "- Done."
