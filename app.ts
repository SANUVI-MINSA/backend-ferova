import express from "express";
import { setupSwagger } from "./src/shared/infrastructure/documentation/swagger";
import healthFacilityRoutes from "./src/context/Healthy-Facility/interfaces/routes/HealthFacilityRoutes";
import userRoutes from "./src/context/iam/interfaces/routes/UserRoutes";
import patientRoutes from "./src/context/patient-management/interfaces/routes/PatientManagementRoutes";

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
export default app;