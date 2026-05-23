import {BadgeType} from "../value-objects/BadgeType";

export class BadgeUnlockedEvent {
    public readonly eventName = "BadgeUnlocked";
    public readonly occurredAt: Date;

    constructor(
        public readonly motherId: string,
        public readonly patientId: string,
        public readonly treatmentId: string,
        public readonly badgeId: string,
        public readonly badgeType: BadgeType,
        public readonly badgeName: string,
        public readonly milestone: number,
        public readonly unlockedAt: Date
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
                badgeId: this.badgeId,
                badgeType: this.badgeType,
                badgeName: this.badgeName,
                milestone: this.milestone,
                unlockedAt: this.unlockedAt
            }
        };
    }
}