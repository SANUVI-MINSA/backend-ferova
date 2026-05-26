import { Router } from "express";
import {authenticate, requireMother} from "../../../../middlewares/auth.middleware";
import {achievementController} from "../dependency-injection/AchievementDependencies";

const router = Router();

/**
 * @swagger
 * /api/achievements-rewards/patients/{patientId}/achievement:
 *   get:
 *     summary: Obtiene el progreso de un paciente (puntos, rachas)
 *     tags:
 *       - Achievements & Rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progreso obtenido exitosamente
 */
router.get(
    "/patients/:patientId/achievement",
    authenticate,
    requireMother,
    achievementController.getPatientAchievement
);

/**
 * @swagger
 * /api/achievements-rewards/patients/{patientId}/badges:
 *   get:
 *     summary: Obtiene todas las medallas de un paciente
 *     tags:
 *       - Achievements & Rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medallas obtenidas exitosamente
 */
router.get(
    "/patients/:patientId/badges",
    authenticate,
    requireMother,
    achievementController.getPatientBadges
);

export default router;