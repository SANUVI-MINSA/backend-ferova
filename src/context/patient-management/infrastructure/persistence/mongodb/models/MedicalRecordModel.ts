import mongoose from "mongoose";

const controlSchema =
    new mongoose.Schema({
        id: String,

        date: Date,

        hemoglobinLevel:
        Number,

        anemiaStatus:
        String
    });

const antecedenteSchema =
    new mongoose.Schema({
        type: String,
        description: String
    });

const medicalRecordSchema =
    new mongoose.Schema(
        {
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
                required: true,
                default: null
            },

            createdAt: {
                type: Date,
                required: true
            },

            updatedAt: {
                type: Date,
                required: true
            },

            hemoglobinLevel: {
                type: Number,
                required: false,  // ✅ Cambiar a false
                default: null     // ✅ Valor por defecto null
            },

            weight: {
                type: Number,
                required: true
            },

            height: {
                type: Number,
                required: true
            },

            gender: {
                type: String,
                required: true
            },

            antecedentes:
                [antecedenteSchema],

            motivoConsulta: {
                type: String,
                required: true
            },

            observaciones: {
                type: String,
                default: null
            },

            sintomas: [
                {
                    type: String
                }
            ],

            controls:
                [controlSchema]
        }
    );

export const MedicalRecordModel =
    mongoose.model(
        "MedicalRecord",
        medicalRecordSchema
    );