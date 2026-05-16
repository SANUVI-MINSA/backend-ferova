import mongoose from "mongoose";

const DailyDoseSchema =
    new mongoose.Schema({
        id: {
            type: String,
            required: true,
            unique: true
        },

        treatmentId: {
            type: String,
            required: true
        },

        scheduledDate: {
            type: Date,
            required: true
        },

        confirmedAt: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            required: true
        }
    });

export const DailyDoseModel =
    mongoose.model(
        "DailyDose",
        DailyDoseSchema
    );