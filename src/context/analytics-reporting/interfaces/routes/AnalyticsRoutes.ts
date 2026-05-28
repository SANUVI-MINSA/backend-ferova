import {Router} from "express";
import {authenticate, requireAdmin} from "../../../../middlewares/auth.middleware";
import {analyticsController} from "../dependency-injection/AnalyticsDependencies";

const router = Router();

/**
 * @swagger
 * /api/analytics/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary (total active facilities, critical facilities, global adherence)
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 */
router.get(
    "/dashboard/summary",
    authenticate,
    requireAdmin,
    analyticsController.getDashboardSummary
);

/**
 * @swagger
 * /api/analytics/facilities:
 *   get:
 *     summary: Get facilities analytics with adherence and risk level
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: riskLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: Facilities analytics retrieved successfully
 */
router.get(
    "/facilities",
    authenticate,
    requireAdmin,
    analyticsController.getFacilitiesAnalytics
);

/**
 * @swagger
 * /api/analytics/heatmap:
 *   get:
 *     summary: Get heatmap data for active facilities (coordinates + risk level)
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: riskLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: Heatmap data retrieved successfully
 */
router.get(
    "/heatmap",
    authenticate,
    requireAdmin,
    analyticsController.getFacilityHeatmapData
);

export default router;