// src/context/achievements-rewards/domain/value-objects/MilestoneCalculator.ts

import { BadgeType } from "./BadgeType";

export class MilestoneCalculator {
    static getMilestone(type: BadgeType, durationDays: number): number {
        switch (type) {
            case BadgeType.FIRST_WEEK:
                return 7;
            case BadgeType.HALF_TREATMENT:
                return Math.ceil(durationDays / 2);
            case BadgeType.TREATMENT_COMPLETED:
                return durationDays;
            default:
                throw new Error(`Unknown badge type: ${type}`);
        }
    }

    static getBadgesForDuration(durationDays: number): BadgeType[] {
        const badges: BadgeType[] = [];

        // FIRST_WEEK: solo si dura al menos 7 días
        if (durationDays >= 7) {
            badges.push(BadgeType.FIRST_WEEK);
        }

        // HALF_TREATMENT: solo si la mitad es mayor a 7 y menor que durationDays
        const halfMilestone = Math.ceil(durationDays / 2);
        if (durationDays >= 30 && halfMilestone > 7 && halfMilestone < durationDays) {
            badges.push(BadgeType.HALF_TREATMENT);
        }

        // TREATMENT_COMPLETED: siempre
        badges.push(BadgeType.TREATMENT_COMPLETED);

        return badges;
    }
}