import express from "express";
import { setupSwagger } from "./src/shared/infrastructure/documentation/swagger";

const app = express();

app.use(express.json());

setupSwagger(app);

export default app;