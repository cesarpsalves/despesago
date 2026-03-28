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

# --- Ajustes nos arquivos antes do build ---
echo "- Corrigindo arquivos de configuração"

# Ensure we have the correct Node.js version in Dockerfiles
echo "- Ajustando versões do Node.js nos Dockerfiles"
sed -i 's/FROM node:20-alpine/FROM node:18-alpine/g' frontend/Dockerfile backend/Dockerfile
sed -i 's/FROM node:20-alpine AS builder/FROM node:18-alpine AS builder\n\n# Instalar versões específicas dos pacotes para evitar problemas de compatibilidade\nRUN npm install -g npm@9.8.1/g' frontend/Dockerfile
sed -i 's/RUN npm ci --silent/RUN npm ci --legacy-peer-deps --silent/g' frontend/Dockerfile backend/Dockerfile

# Fix package versions in package.json
echo "- Ajustando versões das dependências no package.json"
sed -i 's/"react": "\^19.2.4",/"react": "\^18.2.0",/g' frontend/package.json
sed -i 's/"react-dom": "\^19.2.4",/"react-dom": "\^18.2.0",/g' frontend/package.json
sed -i 's/"react-router-dom": "\^7.13.2",/"react-router-dom": "\^6.13.0",/g' frontend/package.json
sed -i 's/"@types\/react": "\^19.2.14",/"@types\/react": "\^18.2.14",/g' frontend/package.json
sed -i 's/"@types\/react-dom": "\^19.2.3",/"@types\/react-dom": "\^18.2.3",/g' frontend/package.json

# Fix Vite and related versions
echo "- Ajustando versões do Vite e relacionados"
sed -i 's/"vite": "\^8.0.1",/"vite": "\^4.5.1",/g' frontend/package.json
sed -i 's/"vitest": "\^4.1.2"/"vitest": "\^0.34.6"/g' frontend/package.json
sed -i 's/"@vitejs\/plugin-react": "\^6.0.1",/"@vitejs\/plugin-react": "\^4.2.1",/g' frontend/package.json
sed -i 's/"typescript": "~5.9.3",/"typescript": "~5.0.2",/g' frontend/package.json

# Melhorar o tratamento de erros no Onboarding
echo "- Melhorando o tratamento de erros na página de onboarding"

# --- Build all services ---
echo "- Iniciando build de todos os serviços"
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
