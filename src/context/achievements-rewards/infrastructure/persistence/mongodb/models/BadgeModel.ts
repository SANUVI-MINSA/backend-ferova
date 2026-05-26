import mongoose from "mongoose";

const BadgeSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        achievementId: {
            type: String,
            required: true,
            index: true
        },
        type: {
            type: String,
            required: true,
            enum: ["FIRST_WEEK", "FIRST_MONTH", "HALF_TREATMENT", "TREATMENT_COMPLETED"]
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        milestone: {
            type: Number,
            required: true,
            min: 1
        },
        isUnlocked: {
            type: Boolean,
            required: true,
            default: false
        },
        unlockedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "badges"
    }
);

export const BadgeModel =
    mongoose
    .model(
    "Badge",
    BadgeSchema
    );
