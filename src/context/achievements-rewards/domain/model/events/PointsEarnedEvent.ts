export class PointsEarnedEvent {
    public readonly eventName = "PointsEarned";
    public readonly occurredAt: Date;

    constructor(
        public readonly motherId: string,
        public readonly patientId: string,
        public readonly treatmentId: string,
        public readonly pointsEarned: number,
        public readonly totalPoints: number,
        public readonly reason: "DOSE_CONFIRMED" | "TREATMENT_COMPLETED"
    ) {
        this.occurredAt = new Date();
    }

    toPrimitives() {
        return {
            eventName: this.eventName,
            occurredAt: this.occurredAt,
            data: {
                motherId: this.motherId,
                patientId: this.patientId,
                treatmentId: this.treatmentId,
                pointsEarned: this.pointsEarned,
                totalPoints: this.totalPoints,
                reason: this.reason
            }
        };
    }
}