import mongoose from "mongoose";

const FoodEntrySchema =
    new mongoose.Schema({
        id: {
            type: String,
            required: true,
            unique: true
        },
        diaryId: {
            type: String,
            required: true
        },
        foodItemId: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        },
        ironContributed: {
            type: Number,
            required: true
        },
        registeredAt: {
            type: Date,
            required: true
        }
    });

export const FoodEntryModel =
    mongoose.model(
        "FoodEntry",
        FoodEntrySchema
    );