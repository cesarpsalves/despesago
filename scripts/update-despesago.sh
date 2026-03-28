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

# Replace frontend Dockerfile completely
echo "- Substituindo Dockerfile do frontend"
cat > frontend/Dockerfile << 'EOF'
# Build Stage
FROM node:16-alpine AS builder
WORKDIR /app

# Copiar apenas os arquivos de definição de pacotes
COPY package*.json ./

# Instalar dependências com configurações mais permissivas
RUN npm install --no-fund --no-audit --legacy-peer-deps

# Copiar o restante dos arquivos
COPY . .

# Pass build arguments as environment variables for Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

# Build
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Replace backend Dockerfile completely
echo "- Substituindo Dockerfile do backend"
cat > backend/Dockerfile << 'EOF'
FROM node:16-alpine

WORKDIR /app

# Instalar dependências primeiro para cache eficiente
COPY package*.json ./
RUN npm install --no-fund --no-audit --legacy-peer-deps

# Copiar restante do código
COPY . .

# Build do TypeScript
RUN npm run build

# Porta do serviço OCR
EXPOSE 3000

# Rodar a aplicação
CMD ["npm", "start"]
EOF

# Fix package versions in package.json
echo "- Ajustando versões das dependências no package.json"
sed -i 's/"react": "\^19.2.4",/"react": "\^18.2.0",/g' frontend/package.json
sed -i 's/"react-dom": "\^19.2.4",/"react-dom": "\^18.2.0",/g' frontend/package.json
sed -i 's/"react-router-dom": "\^7.13.2",/"react-router-dom": "\^6.13.0",/g' frontend/package.json
sed -i 's/"@types\/react": "\^19.2.14",/"@types\/react": "\^18.2.14",/g' frontend/package.json
sed -i 's/"@types\/react-dom": "\^19.2.3",/"@types\/react-dom": "\^18.2.3",/g' frontend/package.json

# Fix Vite and related versions
echo "- Ajustando versões do Vite e relacionados"
sed -i 's/"vite": "\^8.0.1",/"vite": "\^3.2.7",/g' frontend/package.json
sed -i 's/"vite": "\^4.5.1",/"vite": "\^3.2.7",/g' frontend/package.json
sed -i 's/"vitest": "\^4.1.2"/"vitest": "\^0.25.8"/g' frontend/package.json
sed -i 's/"vitest": "\^0.34.6"/"vitest": "\^0.25.8"/g' frontend/package.json
sed -i 's/"@vitejs\/plugin-react": "\^6.0.1",/"@vitejs\/plugin-react": "\^2.2.0",/g' frontend/package.json
sed -i 's/"@vitejs\/plugin-react": "\^4.2.1",/"@vitejs\/plugin-react": "\^2.2.0",/g' frontend/package.json
sed -i 's/"typescript": "~5.9.3",/"typescript": "~4.9.5",/g' frontend/package.json
sed -i 's/"typescript": "~5.0.2",/"typescript": "~4.9.5",/g' frontend/package.json

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