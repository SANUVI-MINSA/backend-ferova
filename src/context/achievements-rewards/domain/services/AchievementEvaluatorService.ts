import { Achievement } from "../model/aggregates/Achievement";
import { Badge } from "../model/entities/Badge";
import { BadgeUnlockedEvent } from "../model/events/BadgeUnlockedEvent";
import { StreakMilestoneReachedEvent } from "../model/events/StreakMilestoneReachedEvent";
import { PointsEarnedEvent } from "../model/events/PointsEarnedEvent";

export class AchievementEvaluatorService {

    evaluateBadges(
        achievement: Achievement,
        badges: Badge[]
    ): { updatedBadges: Badge[]; events: BadgeUnlockedEvent[] } {
        const unlockedBadges: Badge[] = [];
        const events: BadgeUnlockedEvent[] = [];
        const bestStreak = achievement.getBestStreak();

        // Ordenar badges por milestone (menor a mayor)
        const sortedBadges = [...badges].sort((a, b) => a.getMilestone() - b.getMilestone());

        for (const badge of sortedBadges) {
            if (badge.getIsUnlocked()) {
                continue;
            }

            if (badge.canBeUnlockedWithBestStreak(bestStreak)) {
                badge.unlock();
                unlockedBadges.push(badge);

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

    evaluateStreakMilestone(
        achievement: Achievement,
        previousStreak: number,
        currentStreak: number
    ): StreakMilestoneReachedEvent | null {
        const milestones = [7, 15, 30, 60, 90, 120, 150, 180, 365];

        for (const milestone of milestones) {
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

    isTreatmentComplete(totalConfirmedDoses: number, durationDays: number): boolean {
        return totalConfirmedDoses >= durationDays;
    }
}