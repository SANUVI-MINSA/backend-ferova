import { Router } from "express";
import {treatmentController} from "../../context/treatment-tracking/interfaces/dependencies/TreatmentDependencies";
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

export default router;