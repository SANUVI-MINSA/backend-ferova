import express from "express";
import cors from "cors";  // ✅ Importar CORS
import { setupSwagger } from "./src/shared/infrastructure/documentation/swagger";
import healthFacilityRoutes from "./src/context/Healthy-Facility/interfaces/routes/HealthFacilityRoutes";
import userRoutes from "./src/context/iam/interfaces/routes/UserRoutes";
import patientRoutes from "./src/context/patient-management/interfaces/routes/PatientManagementRoutes";
import nutritionalDiaryRoutes from "./src/context/nutration-diary/interfaces/routes/NutritionalDiaryRoutes";
import communicationRoutes from "./src/context/comunication-management/interfaces/routes/CommunicationRoutes"
import treatmentRoutes from "./src/context/treatment-tracking/interfaces/routes/TreatmentRoutes";
import AchievementsRewards from "./src/context/achievements-rewards/interfaces/routes/AchievementRoutes"
import AnalyticsRoutes from "./src/context/analytics-reporting/interfaces/routes/AnalyticsRoutes";

import testRoutes from "./src/shared/test/route-testing"

const app = express();

app.use(cors({
    origin: '*', // Permitir todas las origins (para desarrollo)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));



app.use(express.json());

setupSwagger(app);

app.use(
    "/api/health-facilities",
    healthFacilityRoutes
);
app.use("/api/users", userRoutes)

app.use(
    "/api/patients",
    patientRoutes
);

app.use(
    "/api/nutritional-diary",
    nutritionalDiaryRoutes
);

app.use(
    "/api/communication",
    communicationRoutes
);

app.use("/api/treatment-tracking",
    treatmentRoutes
);

app.use("/api/achievements-rewards",
    AchievementsRewards
    );

app.use("/api/analytics",
    AnalyticsRoutes
);

app.use("/api/test",
        testRoutes
    );

app.get('/', (req, res) => {
    res.json({
        message: 'Ferova API - Healthcare Management System',
        version: '1.0.0',
        status: 'online',
        documentation: '/api-docs',
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DB_TYPE || 'production',
        endpoints: {
            users: '/api/users',
            patients: '/api/patients',
            healthFacilities: '/api/health-facilities',
            nutritionalDiary: '/api/nutritional-diary',
            communication: '/api/communication',
            treatmentTracking: '/api/treatment-tracking',
            achievementsRewards: '/api/achievements-rewards',
            analytics: '/api/analytics',
            test: '/api/test'
        }
    });
});

export default app;