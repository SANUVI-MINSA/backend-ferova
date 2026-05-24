import {AchievementQueryService} from "../../domain/services/AchievementQueryService";
import {GetPatientAchievementQuery} from "../../domain/model/queries/GetPatientAchievementQuery";
import {GetPatientBadgesQuery} from "../../domain/model/queries/GetPatientBadgesQuery";
import {AchievementRepository} from "../../domain/repositories/AchievementRepository";
import {PatientRepository} from "../../../patient-management/domain/repositories/PatientRepository";
import {BadgeRepository} from "../../domain/repositories/BadgeRepository";
import {BadgeType} from "../../domain/model/value-objects/BadgeType";

export class AchievementQueryServiceImpl implements AchievementQueryService {

    constructor(
        private achievementRepository: AchievementRepository,
        private badgeRepository: BadgeRepository,
        private patientRepository: PatientRepository
    )
    {}

    /**
     * Obtiene el progreso de un paciente para la tarjeta principal
     */
    async getPatientAchievement(query: GetPatientAchievementQuery): Promise<any> {
        // 1. Validar que la madre tiene acceso al paciente
        const patient = await this.patientRepository.findById(query.patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }

        const patientData = patient.toPrimitives();
        if (patientData.motherId !== query.motherId) {
            throw new Error("Access denied: This patient is not assigned to you");
        }

        // 2. Buscar el achievement del paciente
        const achievement = await this.achievementRepository.findByPatientId(query.patientId);
        if (!achievement) {
            // Si no hay tratamiento activo, devolver valores por defecto
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

        // 3. Retornar solo los datos que necesita la tarjeta
        return {
            patientId: achievement.getPatientId(),
            patientName: `${patientData.name} ${patientData.lastName}`,
            status: achievement.getStatus(),
            totalPoints: achievement.getTotalPoints(),
            currentStreak: achievement.getCurrentStreak(),
            longestStreak: achievement.getLongestStreak()
        };
    }


    /**
     * Obtiene todas las medallas de un paciente (desbloqueadas y bloqueadas)
     * Con progreso secuencial: una medalla se desbloquea antes de que la siguiente empiece a progresar
     */
    async getPatientBadges(query: GetPatientBadgesQuery): Promise<any> {
        // 1. Validar que la madre tiene acceso al paciente
        const patient = await this.patientRepository.findById(query.patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }

        const patientData = patient.toPrimitives();
        if (patientData.motherId !== query.motherId) {
            throw new Error("Access denied: This patient is not assigned to you");
        }

        // 2. Buscar el achievement del paciente
        const achievement = await this.achievementRepository.findByPatientId(query.patientId);
        if (!achievement) {
            return {
                patientId: query.patientId,
                patientName: `${patientData.name} ${patientData.lastName}`,
                badges: [],
                message: "No active treatment found"
            };
        }

        // 3. Obtener todas las medallas del achievement
        const badges = await this.badgeRepository.findByAchievementId(achievement.getId());

        const currentStreak = achievement.getCurrentStreak();
        const durationDays = achievement.getDurationDays();

        // 4. Definir el orden de los badges y sus milestones
        // El orden es: FIRST_WEEK → FIRST_MONTH → HALF_TREATMENT → TREATMENT_COMPLETED
        const badgesInOrder: { type: BadgeType; milestone: number }[] = [
            { type: BadgeType.FIRST_WEEK, milestone: 7 },
            { type: BadgeType.FIRST_MONTH, milestone: 30 },
            { type: BadgeType.HALF_TREATMENT, milestone: Math.ceil(durationDays / 2) },
            { type: BadgeType.TREATMENT_COMPLETED, milestone: durationDays }
        ];

        // 5. Determinar cuál es la medalla activa actualmente
        let activeBadgeIndex = -1;
        let accumulatedDays = 0;

        for (let i = 0; i < badgesInOrder.length; i++) {
            if (currentStreak >= badgesInOrder[i].milestone) {
                accumulatedDays = badgesInOrder[i].milestone;
            } else {
                activeBadgeIndex = i;
                break;
            }
        }

        // Si todas las medallas están desbloqueadas
        if (activeBadgeIndex === -1) {
            activeBadgeIndex = badgesInOrder.length;
        }

        // 6. Mapear cada medalla con su progreso secuencial
        const badgesWithProgress = badges.map(badge => {
            const badgeType = badge.getType();
            const badgeMilestone = badge.getMilestone();

            // Encontrar el índice de este badge en el orden
            const badgeIndex = badgesInOrder.findIndex(b => b.type === badgeType);
            const isUnlocked = currentStreak >= badgeMilestone;

            let progress = 0;
            let daysNeeded = badgeMilestone;

            if (isUnlocked) {
                // Medalla ya desbloqueada
                progress = 100;
                daysNeeded = 0;
            } else if (badgeIndex === activeBadgeIndex) {
                // Esta es la medalla activa - calcular progreso basado en días acumulados
                const previousMilestone = badgeIndex > 0 ? badgesInOrder[badgeIndex - 1].milestone : 0;
                const daysIntoThisBadge = currentStreak - previousMilestone;
                const neededForThisBadge = badgeMilestone - previousMilestone;

                progress = Math.min(100, Math.floor((daysIntoThisBadge / neededForThisBadge) * 100));
                daysNeeded = neededForThisBadge - daysIntoThisBadge;
            } else if (badgeIndex < activeBadgeIndex) {
                // Medalla anterior (ya desbloqueada)
                progress = 100;
                daysNeeded = 0;
            } else {
                // Medalla futura (aún no alcanzable)
                progress = 0;
                daysNeeded = badgeMilestone;
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

        // Ordenar por milestone (de menor a mayor)
        badgesWithProgress.sort((a, b) => a.milestone - b.milestone);

        return {
            patientId: achievement.getPatientId(),
            patientName: `${patientData.name} ${patientData.lastName}`,
            badges: badgesWithProgress
        };
    }
}