import mongoose from "mongoose";

const nurseAssignmentSchema =
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

            nurseId: {
                type: String,
                required: true
            }
        },
        {
            timestamps: true
        }
    );

export const NurseAssignmentModel =
    mongoose.model(
        "NurseAssignment",
        nurseAssignmentSchema
    );