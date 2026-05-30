import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Determinar qué archivo .env cargar según NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'production';
let envFile = '.env';

if (nodeEnv === 'development') {
    envFile = '.env.development';
}

const envPath = path.resolve(process.cwd(), envFile);
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`[ENV] Cargando: ${envFile}`);
} else {
    dotenv.config();
    console.log(`[ENV] Usando variables por defecto`);
}

// Función para construir la URI de MongoDB (soporta Railway con MONGO_URI_BASE)
const getMongoUri = (): string => {
    // PRIORIDAD 1: MONGO_URI_BASE (para Railway con dos DBs)
    const mongoUriBase = process.env.MONGO_URI_BASE;
    const dbType = process.env.DB_TYPE || 'production';

    if (mongoUriBase) {
        // Limpiar la URI base (eliminar cualquier sufijo previo)
        let cleanBase = mongoUriBase;
        if (cleanBase.endsWith('/ferova_prod')) {
            cleanBase = cleanBase.replace('/ferova_prod', '');
        } else if (cleanBase.endsWith('/ferova_test')) {
            cleanBase = cleanBase.replace('/ferova_test', '');
        }

        // Agregar el sufijo según DB_TYPE
        if (dbType === 'test') {
            return `${cleanBase}/ferova_test`;
        }
        return `${cleanBase}/ferova_prod`;
    }

    // PRIORIDAD 2: MONGO_URI tradicional (para desarrollo local)
    if (process.env.MONGO_URI) {
        return process.env.MONGO_URI;
    }

    // PRIORIDAD 3: Default local
    return 'mongodb://localhost:27017/ferova';
};

export const env = {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: nodeEnv,
    dbType: process.env.DB_TYPE || 'production',
    mongoUri: getMongoUri(),
    jwtSecret: process.env.JWT_SECRET || 'UPC-2026-APLICAIONES-MOVILES',
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    devOmissionMinutes: process.env.DEV_OMISSION_MINUTES,
};

console.log(`[ENV] Entorno: ${env.nodeEnv}`);
console.log(`[ENV] DB Type: ${env.dbType}`);
console.log(`[ENV] MongoDB: ${env.mongoUri}`);