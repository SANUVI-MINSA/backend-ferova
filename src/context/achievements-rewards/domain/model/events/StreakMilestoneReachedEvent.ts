
export class StreakMilestoneReachedEvent {
    public readonly eventName = "StreakMilestoneReached";
    public readonly occurredAt: Date;

    constructor(
        public readonly motherId: string,
        public readonly patientId: string,
        public readonly treatmentId: string,
        public readonly currentStreak: number,
        public readonly milestone: number  // 7, 30, etc.
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
                currentStreak: this.currentStreak,
                milestone: this.milestone
            }
        };
    }
}