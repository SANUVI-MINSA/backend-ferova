import {BadgeType} from "../value-objects/BadgeType";
import {MilestoneCalculator} from "../value-objects/MilestoneCalculator";


export class Badge {
    constructor(
        private id: string,
        private achievementId: string,
        private type: BadgeType,
        private name: string,
        private description: string,
        private milestone: number,
        private isUnlocked: boolean,
        private unlockedAt: Date | null
    ) {
        this.validate()
    }
    private validate(): void {
        if (!this.id) {
            throw new Error("Badge id is required")
        }
        if (!this.achievementId) {
            throw new Error("AchievementId is required")
        }
        if (!this.type) {
            throw new Error("Badge type is required");
        }
        if (!this.name) {
            throw new Error("Badge name is required");
        }
        if (!this.description) {
            throw new Error("Badge description is required");
        }
        if (this.milestone <= 0) {
            throw new Error("Milestone must be greater than zero");
        }
    }

    // Método de negocio: desbloquear badge
    unlock(): void {
        if (this.isUnlocked) {
            throw new Error("Badge is alredy unlocked")
        }
        this.isUnlocked = true;
        this.unlockedAt = new Date();
    }

    // Verificar si la racha actual cumple el milestone
    canBeUnlockedWithStreak(currentStreak : number): boolean {
        if (this.isUnlocked) return false;
        return currentStreak >= this.milestone;
    }

    // Verificar si el bestStreak (mejor racha histórica) cumple el milestone
    canBeUnlockedWithBestStreak(bestStreak: number): boolean {
        if (this.isUnlocked) return false;
        return bestStreak >= this.milestone;
    }

    // Getters
    getId(): string { return this.id; }
    getAchievementId(): string { return this.achievementId; }
    getType(): BadgeType { return this.type; }
    getName(): string { return this.name; }
    getDescription(): string { return this.description; }
    getMilestone(): number { return this.milestone; }
    getIsUnlocked(): boolean { return this.isUnlocked; }
    getUnlockedAt(): Date | null { return this.unlockedAt; }

    // Para crear badges dinamicamente (factory method)
    static create(
        id: string,
        achievementId: string,
        type: BadgeType,
        durationDays: number
    ) : Badge {

        const milestone = MilestoneCalculator.getMilestone(type, durationDays);

        // Nombres y descripciones segun tipo
        let name = "";
        let description = "";

        switch (type) {
            case BadgeType.FIRST_WEEK:
                name = "Primera semana";
                description = "Completaste 7 días consecutivos sin fallar";
                break;
            case BadgeType.FIRST_MONTH:
                name = "Primer mes";
                description = "Completaste 30 días consecutivos sin fallar (solo para tratamientos de 90 días o más)";
                break;
            case BadgeType.HALF_TREATMENT:
                name = "Mitad del tratamiento";
                description = `Alcanzaste la mitad del tratamiento (${milestone} días consecutivos)`;
                break;
            case BadgeType.TREATMENT_COMPLETED:
                name = "Tratamiento completado";
                description = `Completaste el tratamiento completo de ${milestone} días`;
                break;
        }

        return new Badge(
            id,
            achievementId,
            type,
            name,
            description,
            milestone,
            false,  // isUnlocked = false
            null    // unlockedAt = null
        );
    }

    toPrimitives() {
        return {
            id: this.id,
            achievementId: this.achievementId,
            type: this.type,
            name: this.name,
            description: this.description,
            milestone: this.milestone,
            isUnlocked: this.isUnlocked,
            unlockedAt: this.unlockedAt
        };
    }
}