import mongoose from "mongoose";
import { MessageSchema } from "./MessageSchema"

const ConsultationSchema =
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

        nurseId: {
            type: String,
            required: true
        },

        messages: {
            type: [MessageSchema],
            default: []
        },

        createdAt: {
            type: Date,
            required: true
        },

        closedAt: {
            type: Date,
            default: null
        }
    });

export const ConsultationModel =
    mongoose.model(
        "Consultation",
        ConsultationSchema
    );