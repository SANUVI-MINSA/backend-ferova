import { BadgeType } from "./BadgeType";

export class MilestoneCalculator {
    static getMilestone(type: BadgeType, durationDays: number): number {
        switch (type) {
            case BadgeType.FIRST_WEEK:
                return 7;
            case BadgeType.FIRST_MONTH:
                return 30;
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

        // Siempre se crea TREATMENT_COMPLETED
        badges.push(BadgeType.TREATMENT_COMPLETED);

        if (durationDays >= 7) {
            badges.push(BadgeType.FIRST_WEEK);
        }
        if (durationDays >= 30) {
            badges.push(BadgeType.FIRST_MONTH);
        }
        if (durationDays >= 60) { // Solo si hay espacio para half treatment
            badges.push(BadgeType.HALF_TREATMENT);
        }

        return badges;
    }
}