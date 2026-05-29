// src/shared/infrastructure/persistence/mongodb/MongoConnection.ts
import mongoose from "mongoose";
import { env } from "../../config/env";

export class MongoConnection {

    static async connect(): Promise<void> {
        try {
            await mongoose.connect(env.mongoUri);

            console.log(`MongoDB connected successfully to: ${env.mongoUri}`);
            console.log(`Database: ${mongoose.connection.db?.databaseName}`);

        } catch (error) {
            console.error("Mongo connection error", error);
            process.exit(1);
        }
    }
}