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
                url: "https://backend-ferova-test.up.railway.app",
                description: "Test server (Railway)"
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
        "src/context/**/interfaces/routes/**.ts",
        "src/shared/**/*.ts"
    ]
};

export default swaggerOptions;