import express from "express";
import { setupSwagger } from "./src/shared/infrastructure/documentation/swagger";
import healthFacilityRoutes from "./src/context/Healthy-Facility/interfaces/routes/HealthFacilityRoutes";
import userRoutes from "./src/context/iam/interfaces/routes/UserRoutes";
import patientRoutes from "./src/context/patient-management/interfaces/routes/PatientManagementRoutes";
import nutritionalDiaryRoutes from "./src/context/nutration-diary/interfaces/routes/NutritionalDiaryRoutes";
import communicationRoutes from "./src/context/comunication-management/interfaces/routes/CommunicationRoutes"
import treatmentRoutes from "./src/context/treatment-tracking/interfaces/routes/TreatmentRoutes";
import testRoutes from "./src/shared/test/route-testing"

const app = express();

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

app.use("/api/test",
        testRoutes
    )

export default app;