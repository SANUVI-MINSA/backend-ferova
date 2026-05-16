import mongoose from "mongoose";

const RiskScoreSchema =
    new mongoose.Schema(
        {
            id: {
                type: String,
                required: true
            },

            score: {
                type: Number,
                required: true
            },

            riskLevel: {
                type: String,
                required: true
            },

            calculatedAt: {
                type: Date,
                required: true
            }
        },
        {
            _id: false
        }
    );

export const riskScoreSchema = {RiskScoreSchema}