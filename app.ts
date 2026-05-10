import express from "express";
import { setupSwagger } from "./src/shared/infrastructure/documentation/swagger";
import healthFacilityRoutes from "./src/context/Healthy-Facility/interfaces/routes/HealthFacilityRoutes";
import userRoutes from "./src/context/iam/interfaces/routes/UserRoutes";
import patientRoutes from "./src/context/patient-management/interfaces/routes/PatientManagementRoutes";
import nutritionalDiaryRoutes from "./src/context/nutration-diary/interfaces/routes/NutritionalDiaryRoutes";
import communicationRoutes from "./src/context/comunication-management/interfaces/routes/CommunicationRoutes"

const app = express();

app.use(express.json());

setupSwagger(app);

app.get('/', (req, res) => {
    res.json({
        message: 'Ferova API - Healthcare Management System',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            users: '/api/users',
            patients: '/api/patients',
            healthFacilities: '/api/health-facilities',
            nutritionalDiary: '/api/nutritional-diary',
            communication: '/api/communication'
        }
    });
});
export default app;