import { AchievementQueryService } from "../../domain/services/AchievementQueryService";
import { GetPatientAchievementQuery } from "../../domain/model/queries/GetPatientAchievementQuery";
import { GetPatientBadgesQuery } from "../../domain/model/queries/GetPatientBadgesQuery";
import { AchievementRepository } from "../../domain/repositories/AchievementRepository";
import { PatientRepository } from "../../../patient-management/domain/repositories/PatientRepository";
import { BadgeRepository } from "../../domain/repositories/BadgeRepository";

export class AchievementQueryServiceImpl implements AchievementQueryService {

    constructor(
        private achievementRepository: AchievementRepository,
        private badgeRepository: BadgeRepository,
        private patientRepository: PatientRepository
    ) {}

    async getPatientAchievement(query: GetPatientAchievementQuery): Promise<any> {
        const patient = await this.patientRepository.findById(query.patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }

        const patientData = patient.toPrimitives();
        if (patientData.motherId !== query.motherId) {
            throw new Error("Access denied: This patient is not assigned to you");
        }

        const achievement = await this.achievementRepository.findByPatientId(query.patientId);
        if (!achievement) {
            return {
                patientId: query.patientId,
                patientName: `${patientData.name} ${patientData.lastName}`,
                status: "INACTIVE",
                totalPoints: 0,
                currentStreak: 0,
                longestStreak: 0,
                message: "No active treatment found"
            };
        }

        return {
            patientId: achievement.getPatientId(),
            patientName: `${patientData.name} ${patientData.lastName}`,
            status: achievement.getStatus(),
            totalPoints: achievement.getTotalPoints(),
            currentStreak: achievement.getCurrentStreak(),
            longestStreak: achievement.getLongestStreak()
        };
    }

    async getPatientBadges(query: GetPatientBadgesQuery): Promise<any> {
        const patient = await this.patientRepository.findById(query.patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }

        const patientData = patient.toPrimitives();
        if (patientData.motherId !== query.motherId) {
            throw new Error("Access denied: This patient is not assigned to you");
        }

        const achievement = await this.achievementRepository.findByPatientId(query.patientId);
        if (!achievement) {
            return {
                patientId: query.patientId,
                patientName: `${patientData.name} ${patientData.lastName}`,
                badges: [],
                message: "No active treatment found"
            };
        }

        const badges = await this.badgeRepository.findByAchievementId(achievement.getId());
        const currentStreak = achievement.getCurrentStreak();
        const durationDays = achievement.getDurationDays();

        // Ordenar badges por milestone (menor a mayor)
        const sortedBadges = badges.sort((a, b) => a.getMilestone() - b.getMilestone());

        // Calcular progreso para cada badge
        const badgesWithProgress = sortedBadges.map(badge => {
            const milestone = badge.getMilestone();
            const isUnlocked = badge.getIsUnlocked();

            let progress = 0;
            let daysNeeded = milestone;

            if (isUnlocked) {
                progress = 100;
                daysNeeded = 0;
            } else {
                // Calcular progreso basado en racha actual vs milestone
                progress = Math.min(100, Math.floor((currentStreak / milestone) * 100));
                daysNeeded = Math.max(0, milestone - currentStreak);
            }

            return {
                id: badge.getId(),
                type: badge.getType(),
                name: badge.getName(),
                description: badge.getDescription(),
                milestone: badge.getMilestone(),
                isUnlocked: isUnlocked,
                unlockedAt: badge.getUnlockedAt(),
                progress: progress,
                daysNeeded: daysNeeded
            };
        });

        return {
            patientId: achievement.getPatientId(),
            patientName: `${patientData.name} ${patientData.lastName}`,
            badges: badgesWithProgress
        };
    }
}