import { AchievementRepository } from "../../domain/repositories/AchievementRepository";
import { BadgeRepository } from "../../domain/repositories/BadgeRepository";
import { Achievement } from "../../domain/model/aggregates/Achievement";
import { Badge } from "../../domain/model/entities/Badge";
import { MilestoneCalculator } from "../../domain/model/value-objects/MilestoneCalculator";
import { AchievementEvaluatorService } from "../../domain/services/AchievementEvaluatorService";
import { randomUUID } from "node:crypto";

export class TreatmentEventHandlers {
    private evaluatorService: AchievementEvaluatorService;

    constructor(
        private achievementRepository: AchievementRepository,
        private badgeRepository: BadgeRepository
    ) {
        this.evaluatorService = new AchievementEvaluatorService();
    }

    /**
     * Cuando se inicia un tratamiento: crear Achievement y Badges
     */
    async onTreatmentStarted(event: {
        treatmentId: string;
        patientId: string;
        motherId: string;
        durationDays: number;
    }): Promise<void> {
        console.log("[Achievements] TreatmentStarted event received", event);

        // Verificar si ya existe
        const existing = await this.achievementRepository.findByTreatmentId(event.treatmentId);
        if (existing) {
            console.log(`[Achievements] Achievement already exists for ${event.treatmentId}`);
            return;
        }

        // Crear Achievement
        const achievementId = randomUUID();
        const achievement = Achievement.create(
            achievementId,
            event.patientId,
            event.motherId,
            event.treatmentId,
            event.durationDays
        );
        await this.achievementRepository.save(achievement);
        console.log(`[Achievements] Achievement created: ${achievementId}`);

        // Crear Badges
        const badgeTypes = MilestoneCalculator.getBadgesForDuration(event.durationDays);
        const badges: Badge[] = [];

        for (const type of badgeTypes) {
            const badge = Badge.create(randomUUID(), achievementId, type, event.durationDays);
            badges.push(badge);
        }

        await this.badgeRepository.saveMany(badges);
        console.log(`[Achievements] ${badges.length} badges created`);
    }

    /**
     * Cuando se confirma una dosis: actualizar racha y puntos
     */
    async onDailyDoseConfirmed(event: {
        treatmentId: string;
        patientId: string;
        dailyDoseId: string;
    }): Promise<void> {
        console.log("[Achievements] DailyDoseConfirmed event received", event);

        const achievement = await this.achievementRepository.findByTreatmentId(event.treatmentId);
        if (!achievement) {
            console.error(`[Achievements] Achievement not found for treatment ${event.treatmentId}`);
            return;
        }

        if (achievement.getStatus() !== "ACTIVE") {
            console.log(`[Achievements] Achievement is not active, skipping`);
            return;
        }

        const previousStreak = achievement.getCurrentStreak();

        // Actualizar achievement
        achievement.onDoseConfirmed();
        await this.achievementRepository.update(achievement);

        // Evaluar hitos de racha
        const streakEvent = this.evaluatorService.evaluateStreakMilestone(
            achievement,
            previousStreak,
            achievement.getCurrentStreak()
        );

        if (streakEvent) {
            console.log(`[Achievements] Streak milestone reached: ${streakEvent.milestone} days`);
        }

        // Evaluar badges desbloqueadas
        const badges = await this.badgeRepository.findByAchievementId(achievement.getId());
        const { updatedBadges, events } = this.evaluatorService.evaluateBadges(achievement, badges);

        if (updatedBadges.length > 0) {
            await this.badgeRepository.updateMany(updatedBadges);
            console.log(`[Achievements] ${updatedBadges.length} new badges unlocked`);

            for (const event of events) {
                console.log(`[Achievements] Badge unlocked: ${event.badgeName}`);
            }
        }

        console.log(`[Achievements] Points: +10, total: ${achievement.getTotalPoints()}`);
    }

    /**
     * Cuando se omite una dosis: reiniciar racha
     */
    async onDailyDoseOmitted(event: {
        treatmentId: string;
        dailyDoseId: string;
    }): Promise<void> {
        console.log("[Achievements] DailyDoseOmitted event received", event);

        const achievement = await this.achievementRepository.findByTreatmentId(event.treatmentId);
        if (!achievement) {
            console.error(`[Achievements] Achievement not found for treatment ${event.treatmentId}`);
            return;
        }

        if (achievement.getStatus() !== "ACTIVE") {
            console.log(`[Achievements] Achievement is not active, skipping`);
            return;
        }

        achievement.onDoseOmitted();
        await this.achievementRepository.update(achievement);

        console.log(`[Achievements] Streak reset to 0 for achievement ${achievement.getId()}`);
    }

    /**
     * Cuando se completa un tratamiento: marcar como COMPLETED y dar bonus
     */
    async onTreatmentCompleted(event: {
        treatmentId: string;
    }): Promise<void> {
        console.log("[Achievements] TreatmentCompleted event received", event);

        const achievement = await this.achievementRepository.findByTreatmentId(event.treatmentId);
        if (!achievement) {
            console.error(`[Achievements] Achievement not found for treatment ${event.treatmentId}`);
            return;
        }

        achievement.onTreatmentCompleted();
        await this.achievementRepository.update(achievement);

        // Asegurar que TREATMENT_COMPLETED badge esté desbloqueada
        const badges = await this.badgeRepository.findByAchievementId(achievement.getId());
        const treatmentCompletedBadge = badges.find(
            b => b.getType() === "TREATMENT_COMPLETED"
        );

        if (treatmentCompletedBadge && !treatmentCompletedBadge.getIsUnlocked()) {
            treatmentCompletedBadge.unlock();
            await this.badgeRepository.update(treatmentCompletedBadge);
            console.log(`[Achievements] TREATMENT_COMPLETED badge unlocked`);
        }

        console.log(`[Achievements] Achievement marked as COMPLETED, bonus +50 points, total: ${achievement.getTotalPoints()}`);
    }

    /**
     * Cuando se abandona un tratamiento: marcar como ABANDONED
     */
    async onTreatmentAbandoned(event: {
        treatmentId: string;
    }): Promise<void> {
        console.log("[Achievements] TreatmentAbandoned event received", event);

        const achievement = await this.achievementRepository.findByTreatmentId(event.treatmentId);
        if (!achievement) {
            console.error(`[Achievements] Achievement not found for treatment ${event.treatmentId}`);
            return;
        }

        achievement.onTreatmentAbandoned();
        await this.achievementRepository.update(achievement);

        console.log(`[Achievements] Achievement marked as ABANDONED`);
    }
}