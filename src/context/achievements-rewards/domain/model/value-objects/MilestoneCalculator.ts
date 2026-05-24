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
                return this.calculateRemaining(durationDays);
            default:
                throw new Error(`Unknown badge type: ${type}`);
        }
    }

    static getBadgesForDuration(durationDays: number): BadgeType[] {
        const badges: BadgeType[] = [];

        // FIRST_WEEK: siempre que dure al menos 7 días
        if (durationDays >= 7) {
            badges.push(BadgeType.FIRST_WEEK);
        }

        // FIRST_MONTH: solo para duraciones >= 90 días
        if (durationDays >= 90) {
            badges.push(BadgeType.FIRST_MONTH);
        }

        // HALF_TREATMENT: siempre que dure al menos 30 días
        if (durationDays >= 30) {
            badges.push(BadgeType.HALF_TREATMENT);
        }

        // TREATMENT_COMPLETED: solo si queda resto > 0
        const remaining = this.calculateRemaining(durationDays);
        if (remaining > 0) {
            badges.push(BadgeType.TREATMENT_COMPLETED);
        }

        return badges;
    }

    private static calculateRemaining(durationDays: number): number {
        let sum = 7; // FIRST_WEEK

        if (durationDays >= 90) {
            sum += 30; // FIRST_MONTH
        }
        if (durationDays >= 30) {
            sum += Math.ceil(durationDays / 2); // HALF_TREATMENT
        }

        const remaining = durationDays - sum;

        // Si remaining es negativo, devolver 0 (no se crea TREATMENT_COMPLETED)
        return remaining > 0 ? remaining : 0;
    }
}