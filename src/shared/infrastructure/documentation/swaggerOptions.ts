import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ferova API",
            version: "1.0.0",
            description: "Healthcare management API"
        },
        servers: [
            {
                url: "http://localhost:3000/api",
                description: "Local server"
            }
        ]
    },
    apis: [
        "./src/contexts/**/*.ts"
    ]
};

export default swaggerOptions;