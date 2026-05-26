import {Achievement} from "../../domain/model/aggregates/Achievement";
import {AchievementStatus} from "../../domain/model/value-objects/AchievementStatus";

export class AchievementMapper {
    static toDomain(document: any): Achievement {
        return new Achievement(
            document.id,
            document.patientId,
            document.motherId,
            document.treatmentId,
            document.durationDays,
            document.currentStreak,
            document.longestStreak,
            document.bestStreak,
            document.streakStartDate,
            document.totalPoints,
            document.status as AchievementStatus
        );
    }

    static toPersistence(achievement: Achievement): any {
        const data = achievement.toPrimitives();
        return {
            id: data.id,
            patientId: data.patientId,
            motherId: data.motherId,
            treatmentId: data.treatmentId,
            durationDays: data.durationDays,
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
            bestStreak: data.bestStreak,
            streakStartDate: data.streakStartDate,
            totalPoints: data.totalPoints,
            status: data.status
        };
    }
}