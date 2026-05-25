import {AchievementFacade} from "../facade/AchievementFacade";
import {AuthRequest} from "../../../../middlewares/auth.middleware";
import { Response, Request } from "express";

export class AchievementController {
    constructor(
        private facade: AchievementFacade  // ← Ahora usa Facade

    ) {}

    /**
     * GET /patients/:patientId/achievement
     * Obtiene el progreso de un paciente (tarjeta principal)
     */
    getPatientAchievement = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;
            if (!motherId) {
                return res.status(401).json({ error: "Mother ID not found in token" });
            }

            const result = await this.facade.getPatientAchievement({
                patientId: req.params.patientId as string,
                motherId: motherId
            });

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    /**
     * GET /patients/:patientId/badges
     * Obtiene todas las medallas de un paciente
     */
    getPatientBadges = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;
            if (!motherId) {
                return res.status(401).json({ error: "Mother ID not found in token" });
            }

            const result = await this.facade.getPatientBadges({
                patientId: req.params.patientId as string,
                motherId: motherId
            });

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    // ========== ENDPOINT DE PRUEBA (sin autenticación, solo testeos) ==========
    forceEvaluateBadges = async (req: Request, res: Response) => {
        try {
            const { patientId } = req.params as { patientId: string };

            if (!patientId) {
                return res.status(400).json({ error: "patientId is required" });
            }

            const result = await this.facade.forceEvaluateBadges(patientId);
            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}