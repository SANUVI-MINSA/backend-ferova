FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Iniciar la aplicación (NO ejecuta seed)
CMD ["npm", "start"]