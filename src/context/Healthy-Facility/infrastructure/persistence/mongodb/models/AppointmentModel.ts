import mongoose from "mongoose";

const appointmentSchema =
    new mongoose.Schema(
        {
            id: {
                type: String,
                required: true,
                unique: true
            },

            facilityId: {
                type: String,
                required: true
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
                default: null
            },

            appointmentDate: {
                type: String,
                required: true
            },

            appointmentTime: {
                type: String,
                required: true
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

export const AppointmentModel =
    mongoose.model(
        "Appointment",
        appointmentSchema
    );