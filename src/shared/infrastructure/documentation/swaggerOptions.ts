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
                url: "http://localhost:3000",
                description: "Local server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: [
        // Para desarrollo (TypeScript)
        "src/context/**/interfaces/routes/*.ts",
        // Para producción (JavaScript compilado)
        "dist/src/context/**/interfaces/routes/*.js"
    ]
};

export default swaggerOptions;