import mongoose from "mongoose";

const FoodItemSchema =
    new mongoose.Schema({
        id: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        nutrientContent: {
            ironMg: Number,
            ironType: String
        },
        isInhibitor: {
            type: Boolean,
            required: true
        },
        category: {
            type: String,
            required: true
        }
    });

export const FoodItemModel =
    mongoose.model(
        "FoodItem",
        FoodItemSchema
    );