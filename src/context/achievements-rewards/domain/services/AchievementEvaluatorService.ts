import {Achievement} from "../model/aggregates/Achievement";
import {Badge} from "../model/entities/Badge";
import {BadgeUnlockedEvent} from "../model/events/BadgeUnlockedEvent";
import {StreakMilestoneReachedEvent} from "../model/events/StreakMilestoneReachedEvent";
import {PointsEarnedEvent} from "../model/events/PointsEarnedEvent";

export class AchievementEvaluatorService {

    /**
     * Evalúa qué badges se pueden desbloquear basado en el bestStreak
     * Retorna los badges recién desbloqueados y los eventos generados
     */
    evaluateBadges(
        achievement: Achievement,
        badges: Badge[]
    ): { updatedBadges: Badge[]; events: BadgeUnlockedEvent[] } {
        const unlockedBadges: Badge[] = [];
        const events: BadgeUnlockedEvent[] = [];
        const bestStreak = achievement.getBestStreak();

        for (const badge of badges) {
            // Si ya está desbloqueada, saltar
            if (badge.getIsUnlocked()) {
                continue;
            }

            // Verificar si el bestStreak alcanza el milestone
            if (badge.canBeUnlockedWithBestStreak(bestStreak)) {
                badge.unlock();
                unlockedBadges.push(badge);

                // Crear evento
                const event = new BadgeUnlockedEvent(
                    achievement.getMotherId(),
                    achievement.getPatientId(),
                    achievement.getTreatmentId(),
                    badge.getId(),
                    badge.getType(),
                    badge.getName(),
                    badge.getMilestone(),
                    badge.getUnlockedAt()!
                );
                events.push(event);
            }
        }

        return { updatedBadges: unlockedBadges, events };
    }

    /**
     * Evalúa si se alcanzó un hito de racha (7, 30, etc.)
     * Retorna el evento si se alcanzó un nuevo hito
     */
    evaluateStreakMilestone(
        achievement: Achievement,
        previousStreak: number,
        currentStreak: number
    ): StreakMilestoneReachedEvent | null {
        // Hitos que nos interesan: 7, 30, 60, 90, etc.
        const milestones = [7, 30, 60, 90, 120, 150, 180, 365];

        for (const milestone of milestones) {
            // Si antes no había alcanzado el hito y ahora sí
            if (previousStreak < milestone && currentStreak >= milestone) {
                return new StreakMilestoneReachedEvent(
                    achievement.getMotherId(),
                    achievement.getPatientId(),
                    achievement.getTreatmentId(),
                    currentStreak,
                    milestone
                );
            }
        }

        return null;
    }

    /**
     * Calcula los puntos ganados según el evento
     */
    calculatePoints(eventType: "DOSE_CONFIRMED" | "TREATMENT_COMPLETED"): number {
        switch (eventType) {
            case "DOSE_CONFIRMED":
                return 10;
            case "TREATMENT_COMPLETED":
                return 50;
            default:
                return 0;
        }
    }

    /**
     * Genera evento de puntos ganados
     */
    createPointsEvent(
        achievement: Achievement,
        pointsEarned: number,
        reason: "DOSE_CONFIRMED" | "TREATMENT_COMPLETED"
    ): PointsEarnedEvent {
        return new PointsEarnedEvent(
            achievement.getMotherId(),
            achievement.getPatientId(),
            achievement.getTreatmentId(),
            pointsEarned,
            achievement.getTotalPoints(),
            reason
        );
    }

    /**
     * Verifica si el tratamiento está completo basado en las dosis confirmadas
     * (Este método puede necesitar datos del tratamiento)
     */
    isTreatmentComplete(totalConfirmedDoses: number, durationDays: number): boolean {
        return totalConfirmedDoses >= durationDays;
    }
}
