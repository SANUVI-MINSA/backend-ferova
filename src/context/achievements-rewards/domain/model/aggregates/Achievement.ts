import {AchievementStatus} from "../value-objects/AchievementStatus";

export class Achievement {
    constructor(
        private id: string,
        private patientId: string,
        private motherId: string,
        private treatmentId: string,
        private durationDays: number,
        private currentStreak: number,
        private longestStreak: number,
        private bestStreak: number,      //  mejor racha histórica (para badges)
        private streakStartDate: Date | null,
        private totalPoints: number,
        private status: AchievementStatus
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.id) throw new Error("Achievement id is required");
        if (!this.patientId) throw new Error("Patient id is required");
        if (!this.motherId) throw new Error("Mother id is required");
        if (!this.treatmentId) throw new Error("Treatment id is required");
        if (this.durationDays <= 0) throw new Error("Duration days must be greater than zero");
        if (this.currentStreak < 0) throw new Error("Current streak cannot be negative");
        if (this.longestStreak < 0) throw new Error("Longest streak cannot be negative");
        if (this.bestStreak < 0) throw new Error("Best streak cannot be negative");
        if (this.totalPoints < 0) throw new Error("Total points cannot be negative");
        if (!this.status) throw new Error("Status is required");
    }

    // Confirmar dosis (evento del BC Treatment Tracking)
    onDoseConfirmed(): void {
        if (this.status !== AchievementStatus.ACTIVE) {
            throw new Error("Cannot update points on non-active achievement");
        }

        // 1. Sumar puntos (+10)
        this.totalPoints += 10;

        // 2. Actualizar racha actual
        const previousStreak = this.currentStreak;
        this.currentStreak++;

        // 3. Actualizar streakStartDate si es nueva racha
        if (previousStreak === 0) {
            this.streakStartDate = new Date();
        }

        // 4. Actualizar longestStreak (mejor racha histórica)
        if (this.currentStreak > this.longestStreak) {
            this.longestStreak = this.currentStreak;
        }

        // 5. Actualizar bestStreak (para badges - NO se reinicia nunca)
        if (this.currentStreak > this.bestStreak) {
            this.bestStreak = this.currentStreak;
        }
    }

    // Omitir dosis (evento del BC Treatment Tracking)
    onDoseOmitted(): void {
        if (this.status !== AchievementStatus.ACTIVE) {
            throw new Error("Cannot update non-active achievement");
        }

        // 1. NO se suman puntos
        // 2. La racha actual se reinicia
        this.currentStreak = 0;
        this.streakStartDate = null;

        // 3. bestStreak NO cambia (se mantiene el mejor histórico)
        // 4. longestStreak NO cambia
    }

    // Completar tratamiento (evento del BC Treatment Tracking)
    onTreatmentCompleted(): void {
        if (this.status !== AchievementStatus.ACTIVE) {
            throw new Error("Only active treatments can be completed");
        }

        // Bonus final por completar tratamiento
        this.totalPoints += 50;
        this.status = AchievementStatus.COMPLETED;
    }

    // Abandonar tratamiento
    onTreatmentAbandoned(): void {
        if (this.status !== AchievementStatus.ACTIVE) {
            throw new Error("Only active treatments can be abandoned");
        }
        this.status = AchievementStatus.ABANDONED;
    }

    // Getters
    getId(): string { return this.id; }
    getPatientId(): string { return this.patientId; }
    getMotherId(): string { return this.motherId; }
    getTreatmentId(): string { return this.treatmentId; }
    getDurationDays(): number { return this.durationDays; }
    getCurrentStreak(): number { return this.currentStreak; }
    getLongestStreak(): number { return this.longestStreak; }
    getBestStreak(): number { return this.bestStreak; }
    getStreakStartDate(): Date | null { return this.streakStartDate; }
    getTotalPoints(): number { return this.totalPoints; }
    getStatus(): AchievementStatus { return this.status; }

    // Factory method para crear nuevo Achievement
    static create(
        id: string,
        patientId: string,
        motherId: string,
        treatmentId: string,
        durationDays: number
    ): Achievement {
        return new Achievement(
            id,
            patientId,
            motherId,
            treatmentId,
            durationDays,
            0,          // currentStreak inicial
            0,          // longestStreak inicial
            0,          // bestStreak inicial
            null,       // streakStartDate inicial
            0,          // totalPoints inicial
            AchievementStatus.ACTIVE
        );
    }

    toPrimitives() {
        return {
            id: this.id,
            patientId: this.patientId,
            motherId: this.motherId,
            treatmentId: this.treatmentId,
            durationDays: this.durationDays,
            currentStreak: this.currentStreak,
            longestStreak: this.longestStreak,
            bestStreak: this.bestStreak,
            streakStartDate: this.streakStartDate,
            totalPoints: this.totalPoints,
            status: this.status
        };
    }
}