import {riskScoreSchema} from "./RiskScoreModel";
import mongoose from "mongoose";

const TreatmentSchema =
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

        nurseId: {
            type: String,
            required: true
        },

        supplement: {
            type: String,
            required: true
        },

        quantity: {
            type: String,
            required: true
        },

        dosingHours: {
            type: String,
            required: true
        },

        durationDays: {
            type: Number,
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            required: true
        },

        adherenceScore: {
            type: Number,
            required: true
        },

        currentStreak: {
            type: Number,
            required: true
        },

        totalConfirmed: {
            type: Number,
            required: true
        },

        totalOmitted: {
            type: Number,
            required: true
        },

        completionObservation: {
            type: String,
            default: null
        },

        abandonmentObservation: {
            type: String,
            default: null
        },

        riskScore: {
            type: riskScoreSchema,
            required: true
        }
    });

export const TreatmentModel =
    mongoose.model(
        "Treatment",
        TreatmentSchema
    );