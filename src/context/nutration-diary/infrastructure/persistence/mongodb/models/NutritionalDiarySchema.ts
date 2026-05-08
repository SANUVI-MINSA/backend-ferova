import mongoose from "mongoose";

const NutritionalDiarySchema =
    new mongoose.Schema({
        id: {
            type: String,
            required: true,
            unique: true
        },
        patientId: {
            type: String,
            required: true
        },
        motherId: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true,
            index: true
        },
        totalIronAbsorbed: {
            type: Number,
            required: true
        },
        hasInhibitor: {
            type: Boolean,
            required: true
        }
    });

export const NutritionalDiaryModel =
    mongoose.model(
        "NutritionalDiary",
        NutritionalDiarySchema
    );