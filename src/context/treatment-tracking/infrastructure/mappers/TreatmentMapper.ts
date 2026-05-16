import { Treatment } from "../../model/domain/aggregates/Treatment"
import { RiskScore } from
        "../../model/domain/entities/RiskScore";

export class TreatmentMapper {

    static toDomain(
        document: any
    ): Treatment {

        const riskScore =
            new RiskScore(
                document.riskScore.id,
                document.riskScore.score,
                document.riskScore.riskLevel || "LOW",
                document.riskScore.calculatedAt || new Date()
            );

        return new Treatment(
            document.id,
            document.patientId,
            document.nurseId,
            document.supplement,
            document.quantity,
            document.dosingHours,
            document.durationDays,
            document.startDate,
            document.endDate,
            document.status,
            document.adherenceScore,
            document.currentStreak,
            document.totalConfirmed,
            document.totalOmitted,
            document.completionObservation,
            document.abandonmentObservation,
            riskScore
        );
    }

    static toPersistence(treatment: Treatment) {
        const data = treatment.toPrimitives();

        return {
            id: data.id,
            patientId: data.patientId,
            nurseId: data.nurseId,
            supplement: data.supplement,
            quantity: data.quantity,
            dosingHours: data.dosingHours,
            durationDays: data.durationDays,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status,
            adherenceScore: data.adherenceScore,
            currentStreak: data.currentStreak,
            totalConfirmed: data.totalConfirmed,
            totalOmitted: data.totalOmitted,
            completionObservation: data.completionObservation,
            abandonmentObservation: data.abandonmentObservation,
            riskScore: {
                id: data.riskScore.id,
                score: data.riskScore.score,
                riskLevel: data.riskScore.riskLevel,
                calculatedAt: data.riskScore.calculatedAt
            }
        };
    }
}