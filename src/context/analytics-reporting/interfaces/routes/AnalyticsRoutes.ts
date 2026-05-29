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

// En AnalyticsRoutes.ts - Agregar después de los otros endpoints

/**
 * @swagger
 * /api/analytics/facilities/top:
 *   get:
 *     summary: Get top 4 facilities with highest adherence rate
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     description: Returns the top 4 health facilities ordered by adherence rate (highest first). Used for the main dashboard.
 *     responses:
 *       200:
 *         description: Top 4 facilities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facilities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       facilityId:
 *                         type: string
 *                         example: "facility-001"
 *                       facilityName:
 *                         type: string
 *                         example: "Posta Canto Grande"
 *                       districtName:
 *                         type: string
 *                         example: "San Juan Lurigancho"
 *                       adherenceRate:
 *                         type: number
 *                         example: 80
 *                       riskLevel:
 *                         type: string
 *                         enum: [LOW, MEDIUM, HIGH]
 *                         example: "LOW"
 *                       totalPatients:
 *                         type: number
 *                         example: 8
 *                       totalConfirmed:
 *                         type: number
 *                         example: 120
 *                       totalOmitted:
 *                         type: number
 *                         example: 30
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    "/facilities/top",
    authenticate,
    requireAdmin,
    analyticsController.getTopFacilities
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