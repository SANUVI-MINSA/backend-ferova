import { Router } from "express";
import {treatmentController} from "../../context/treatment-tracking/interfaces/dependencies/TreatmentDependencies";
import {
    achievementController
} from "../../context/achievements-rewards/interfaces/dependency-injection/AchievementDependencies";
const router = Router();

/**
 * @swagger
 * /api/test/doses/force-omit:
 *   post:
 *     summary: "[SOLO PRUEBAS] Forzar omisión de una dosis"
 *     tags:
 *       - Testing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dailyDoseId
 *             properties:
 *               dailyDoseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dosis omitida forzosamente
 */
router.post(
    "/doses/force-omit",
    treatmentController.forceOmitDoseForTesting
);

/**
 * @swagger
 * /api/test/doses/force-confirm:
 *   post:
 *     summary: "[SOLO PRUEBAS] Forzar confirmación de una dosis"
 *     tags:
 *       - Testing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dailyDoseId
 *             properties:
 *               dailyDoseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dosis confirmada forzosamente
 */
router.post("/doses/force-confirm", treatmentController.forceConfirmDoseForTesting);


/**
 * @swagger
 * /api/test/force-evaluate-badges/{patientId}:
 *   post:
 *     summary: "[SOLO PRUEBAS] Forzar evaluación de badges para desbloquear medallas"
 *     tags:
 *       - Testing
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Badges evaluados y desbloqueados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 unlockedBadges:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       name:
 *                         type: string
 *                       unlockedAt:
 *                         type: string
 *                 events:
 *                   type: array
 *       400:
 *         description: Error en la solicitud
 *       403:
 *         description: Endpoint solo disponible en desarrollo
 */
router.post(
    "/force-evaluate-badges/:patientId",
    achievementController.forceEvaluateBadges
);

export default router;