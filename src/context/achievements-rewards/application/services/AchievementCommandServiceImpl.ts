import {AchievementCommandService} from "../../domain/services/AchievementCommandService";
import {AchievementEvaluatorService} from "../../domain/services/AchievementEvaluatorService";
import {AchievementRepository} from "../../domain/repositories/AchievementRepository";
import {BadgeRepository} from "../../domain/repositories/BadgeRepository";

export class AchievementCommandServiceImpl implements AchievementCommandService {
    private evaluatorService: AchievementEvaluatorService;

    constructor(
        private achievementRepository: AchievementRepository,
        private badgeRepository: BadgeRepository
    ) {
        this.evaluatorService = new AchievementEvaluatorService();
    }

    /**
     * [SOLO PRUEBAS] Fuerza la evaluación de badges para un paciente
     */
    async forceEvaluateBadges(patientId: string): Promise<any> {

        // Buscar achievement por patientId
        const achievement = await this.achievementRepository.findByPatientId(patientId);
        if (!achievement) {
            throw new Error("Achievement not found for this patient");
        }

        // Obtener todas las badges del achievement
        const badges = await this.badgeRepository.findByAchievementId(achievement.getId());

        // Evaluar qué badges se pueden desbloquear
        const { updatedBadges, events } = this.evaluatorService.evaluateBadges(achievement, badges);

        // Guardar cambios
        if (updatedBadges.length > 0) {
            await this.badgeRepository.updateMany(updatedBadges);
        }

        return {
            message: `${updatedBadges.length} badges unlocked`,
            unlockedBadges: updatedBadges.map(b => ({
                id: b.getId(),
                type: b.getType(),
                name: b.getName(),
                unlockedAt: b.getUnlockedAt()
            })),
            events: events.map(e => e.toPrimitives())
        };
    }
}