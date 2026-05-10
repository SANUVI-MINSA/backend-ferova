# Etapa 1: Builder - Compilar TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias (incluyendo devDependencies)
RUN npm ci --include=dev

COPY . .

# Compilar TypeScript
RUN npm run build

# ============================================
# EJECUTAR EL SEED DE ALIMENTOS DURANTE EL BUILD
# ============================================
RUN npm run seed:foods

# ============================================

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production

# Copiar el código compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]