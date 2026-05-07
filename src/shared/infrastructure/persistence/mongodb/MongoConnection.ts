import mongoose from "mongoose";

export class MongoConnection {

    static async connect(): Promise<void> {
        try {
            await mongoose.connect(
                process.env.MONGO_URI!
            );

            console.log(
                "MongoDB connected successfully"
            );

        } catch (error) {
            console.error(
                "Mongo connection error",
                error
            );
        }
    }
}