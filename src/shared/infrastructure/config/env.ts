// src/shared/infrastructure/config/env.ts
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Determinar qué archivo .env cargar según NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
let envFile = '.env'; // archivo por defecto

if (nodeEnv === 'production') {
    envFile = '.env';
} else if (nodeEnv === 'development') {
    envFile = '.env.development';
}

// Verificar si el archivo existe
const envPath = path.resolve(process.cwd(), envFile);
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`[ENV] Cargando configuración desde: ${envFile}`);
} else {
    dotenv.config();
    console.log(`[ENV] Archivo ${envFile} no encontrado, usando variables por defecto`);
}

export const env = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ferova',
    jwtSecret: process.env.JWT_SECRET || 'UPC-2026-APLICAIONES-MOVILES',
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    devOmissionMinutes: process.env.DEV_OMISSION_MINUTES,
};

console.log(`[ENV] Entorno: ${env.nodeEnv}`);
console.log(`[ENV] MongoDB: ${env.mongoUri}`);