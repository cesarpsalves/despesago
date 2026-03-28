FROM node:20-alpine

WORKDIR /app

# Instalar dependências primeiro para cache eficiente
COPY package*.json ./
RUN npm ci --legacy-peer-deps --silent

# Copiar restante do código
COPY . .

# Build do TypeScript
RUN npm run build

# Porta do serviço OCR
EXPOSE 3000

# Rodar a aplicação
CMD ["npm", "start"]
