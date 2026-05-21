import app from "./app";
import { env } from "./src/shared/infrastructure/config/env";
import { MongoConnection } from "./src/shared/infrastructure/persistence/mongodb/MongoConnection";
import {DoseEvaluationScheduler} from "./src/context/treatment-tracking/application/services/DoseEvaluationScheduler";
import {
    MongoTreatmentRepository
} from "./src/context/treatment-tracking/infrastructure/persistence/mongodb/repositories/MongoTreatmentRepository";
import {
    MongoDailyDoseRepository
} from "./src/context/treatment-tracking/infrastructure/persistence/mongodb/repositories/MongoDailyDoseRepository";

async function startServer() {
    // Conectar a MongoDB
    await MongoConnection.connect();
    console.log('[Server] Conectado a MongoDB');

    let scheduler: DoseEvaluationScheduler | null = null;

    try {
        const treatmentRepository = new MongoTreatmentRepository();
        const dailyDoseRepository = new MongoDailyDoseRepository();

        scheduler = new DoseEvaluationScheduler(
            dailyDoseRepository,
            treatmentRepository
        );

        scheduler.startScheduler();
        console.log('[Server] Scheduler de dosis iniciado correctamente');

        // Opcional: Guardar en global para pruebas manuales (solo desarrollo)
        if (process.env.NODE_ENV === 'development') {
            (global as any).evaluateDosesManually = () => scheduler?.evaluateOnce();
            console.log('[Server] Modo desarrollo: Puedes ejecutar "global.evaluateDosesManually()" en consola para pruebas');
        }

    } catch (error) {
        console.error('[Server] Error al iniciar scheduler:', error);
    }

    app.listen(env.port, () => {
        console.log(`Server running on ${env.port}`);
        console.log(`Swagger docs: http://localhost:${env.port}/api-docs`);
    });
}

process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM recibido, cerrando scheduler...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[Server] SIGINT recibido, cerrando scheduler...');
    process.exit(0);
});

startServer();