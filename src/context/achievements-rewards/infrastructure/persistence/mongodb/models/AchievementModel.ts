import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        patientId: {
            type: String,
            required: true,
            index: true
        },
        motherId: {
            type: String,
            required: true,
            index: true
        },
        treatmentId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        durationDays: {
            type: Number,
            required: true,
            min: 1
        },
        currentStreak: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        longestStreak: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        bestStreak: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        streakStartDate: {
            type: Date,
            default: null
        },
        totalPoints: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            required: true,
            enum: ["ACTIVE", "COMPLETED", "ABANDONED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true,  // Agrega createdAt y updatedAt automáticamente
        collection: "achievements"
    }
);

export const AchievementModel =
    mongoose
    .model(
    "Achievement",
    AchievementSchema
    );
