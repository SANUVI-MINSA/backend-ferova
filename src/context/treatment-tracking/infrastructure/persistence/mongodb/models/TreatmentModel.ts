// TreatmentModel.ts
import mongoose from "mongoose";

// Definir el schema para RiskScore como subdocumento
const RiskScoreSchema = new mongoose.Schema({
    id: { type: String, required: true },
    score: { type: Number, required: true },
    riskLevel: { type: String, required: true, enum: ["LOW", "MEDIUM", "HIGH"] },
    calculatedAt: { type: Date, required: true }
}, { _id: true }); // _id: true para mantener el ObjectId automático

const TreatmentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    nurseId: { type: String, required: true },
    supplement: { type: String, required: true },
    quantity: { type: String, required: true },
    dosingHours: { type: String, required: true },
    durationDays: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ["ACTIVE", "COMPLETED", "ABANDONED"] },
    adherenceScore: { type: Number, required: true },
    currentStreak: { type: Number, required: true },
    totalConfirmed: { type: Number, required: true },
    totalOmitted: { type: Number, required: true },
    completionObservation: { type: String, default: null },
    abandonmentObservation: { type: String, default: null },
    riskScore: { type: RiskScoreSchema, required: true } // ← Definir como subdocumento
});

export const TreatmentModel = mongoose.model("Treatment", TreatmentSchema);