# Build Stage
FROM node:18-alpine AS builder

# Instalar versões específicas dos pacotes para evitar problemas de compatibilidade
RUN npm install -g npm@9.8.1
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps --silent
COPY . .

# Pass build arguments as environment variables for Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production Stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
