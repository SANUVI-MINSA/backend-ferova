import app from "./app";
import { env } from "./src/shared/infrastructure/config/env";
import {MongoConnection} from "./src/shared/infrastructure/persistence/mongodb/MongoConnection";

async function startServer() {
    await MongoConnection.connect();

    app.listen(env.port, () => {
        console.log(`Server running on ${env.port}`);
        console.log(
            `Swagger docs: http://localhost:${env.port}/api-docs`
        );
    });
}

startServer();