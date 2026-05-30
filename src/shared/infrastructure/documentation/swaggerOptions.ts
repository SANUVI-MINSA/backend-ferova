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
                url: "https://backend-ferova-production-187b.up.railway.app",
                description: "Production server (Railway)"
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