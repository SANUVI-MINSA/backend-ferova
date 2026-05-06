import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        lastname: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true
        },

        dni: {
            type: String,
            required: true,
            unique: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        phone: {
            type: String,
            required: true,
            unique: true
        },

        resetCode: {
            type: String,
            default: null
        },

        resetCodeExpiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const UserModel = mongoose.model(
    "User",
    userSchema
);