# Build Stage

FROM node:18-alpine AS builder
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
