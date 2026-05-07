import mongoose from "mongoose";

const patientSchema =
    new mongoose.Schema(
        {
            id: {
                type: String,
                required: true,
                unique: true
            },

            name: {
                type: String,
                required: true
            },

            lastName: {
                type: String,
                required: true
            },

            birthDate: {
                type: Date,
                required: true
            },

            currentWeight: {
                type: Number,
                required: true
            },

            currentHeight: {
                type: Number,
                required: true
            },

            motherId: {
                type: String,
                required: true
            },

            nurseId: {
                type: String,
                default: null
            },

            gender: {
                type: String,
                required: true
            },

            facilityId: {
                type: String,
                default: null
            },

            status: {
                type: String,
                required: true
            }
        },
        {
            timestamps: true
        }
    );

export const PatientModel =
    mongoose.model(
        "Patient",
        patientSchema
    );