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
        ]
    },
    apis: [
        "src/context/**/interfaces/routes/**.ts",
    ]
};

export default swaggerOptions;