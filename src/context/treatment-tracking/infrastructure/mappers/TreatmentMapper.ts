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
                document.riskScore.riskLevel,
                document.riskScore.calculatedAt
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

    static toPersistence(
        treatment: Treatment
    ) {
        return treatment
            .toPrimitives();
    }
}