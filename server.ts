import app from "./app";
import { env } from "./src/shared/infrastructure/config/env";

app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(`Swagger docs: http://localhost:${env.port}/api-docs`);
});