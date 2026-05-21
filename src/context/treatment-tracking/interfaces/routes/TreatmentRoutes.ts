import { Router } from "express";
import { treatmentController } from "../dependencies/TreatmentDependencies";
import {authenticate, requireMother, requireNurse} from "../../../../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/treatment-tracking/treatments:
 *   post:
 *     summary: Start a new treatment
 *     tags:
 *       - Treatment Tracking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - supplementName
 *               - quantity
 *               - dosingHours
 *               - durationDays
 *             properties:
 *               patientId:
 *                 type: string
 *               supplementName:
 *                 type: string
 *               quantity:
 *                 type: string
 *               dosingHours:
 *                 type: string
 *               durationDays:
 *                 type: number
 *     responses:
 *       201:
 *         description: Treatment created successfully
 *       400:
 *         description: Validation error
 */
router.post(
    "/treatments",
    authenticate,
    requireNurse,
    treatmentController.startTreatment
);

/**
 * @swagger
 * /api/treatment-tracking/doses/confirm:
 *   post:
 *     summary: Confirm today's dose
 *     tags:
 *       - Treatment Tracking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dose confirmed successfully
 */
router.post(
    "/doses/confirm",
    authenticate,
    requireMother,
    treatmentController.confirmDose
);

/**
 * @swagger
 * /api/treatment-tracking/treatments/complete:
 *   put:
 *     summary: Complete treatment
 *     tags:
 *       - Treatment Tracking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - treatmentId
 *               - nurseId
 *             properties:
 *               treatmentId:
 *                 type: string
 *               nurseId:
 *                 type: string
 *               observation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Treatment completed
 */
router.put(
    "/treatments/complete",
    treatmentController.completeTreatment
);

/**
 * @swagger
 * /api/treatment-tracking/treatments/abandon:
 *   put:
 *     summary: Mark treatment as abandoned
 *     tags:
 *       - Treatment Tracking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - treatmentId
 *               - nurseId
 *             properties:
 *               treatmentId:
 *                 type: string
 *               nurseId:
 *                 type: string
 *               observation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Treatment abandoned
 */
router.put(
    "/treatments/abandon",
    treatmentController.abandonTreatment
);


/**
 * @swagger
 * /api/treatment-tracking/doses/evaluate-missed:
 *   post:
 *     summary: Evaluate missed dose
 *     tags:
 *       - Treatment Tracking
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
 *         description: Missed dose evaluated
 */
router.post(
    "/doses/evaluate-missed",
    treatmentController.evaluateMissedDose
);


/**
 * @swagger
 * /api/treatment-tracking/patients/{patientId}/today-dose:
 *   get:
 *     summary: Get today's dose
 *     tags:
 *       - Treatment Tracking
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Today's dose retrieved
 */
router.get(
    "/patients/:patientId/today-dose",
    treatmentController.getTodayDose
);

/**
 * @swagger
 * /api/treatment-tracking/patients/{patientId}/dose-history:
 *   get:
 *     summary: Get patient dose history
 *     tags:
 *       - Treatment Tracking
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
 *         description: Dose history retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get(
    "/patients/:patientId/dose-history",
    authenticate,
    requireMother,
    treatmentController.getPatientDoseHistory
);

/**
 * @swagger
 * /api/treatment-tracking/nurses/pending-patients:
 *   get:
 *     summary: Get pending patients by nurse
 *     tags:
 *       - Treatment Tracking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending patients retrieved successfully
 *       404:
 *         description: Nurse not found
 */
router.get(
    "/nurses/pending-patients",
    authenticate,
    requireNurse,
    treatmentController.getPendingPatientsByNurse
);

/**
 * @swagger
 * /api/treatment-tracking/risk-overview:
 *   get:
 *     summary: Get risk level overview
 *     tags:
 *       - Treatment Tracking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Risk overview retrieved successfully
 */
router.get(
    "/risk-overview",
    authenticate,
    requireNurse,
    treatmentController.getRiskLevelOverview
);


/**
 * @swagger
 * /api/treatment-tracking/nurses/{nurseId}/treatments:
 *   get:
 *     summary: Get treatments by nurse
 *     tags:
 *       - Treatment Tracking
 *     parameters:
 *       - in: path
 *         name: nurseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - COMPLETED
 *             - ABANDONED
 *     responses:
 *       200:
 *         description: Treatments retrieved successfully
 */
router.get(
    "/nurses/:nurseId/treatments",
    treatmentController.getTreatmentsByNurse
);

/**
 * @swagger
 * /api/treatment-tracking/treatments/{treatmentId}:
 *   get:
 *     summary: Get treatment details
 *     tags:
 *       - Treatment Tracking
 *     parameters:
 *       - in: path
 *         name: treatmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Treatment details retrieved successfully
 *       404:
 *         description: Treatment not found
 */
router.get(
    "/treatments/:treatmentId",
    treatmentController.getTreatmentDetails
);

/**
 * @swagger
 * /api/treatment-tracking/risk/{riskLevel}/patients:
 *   get:
 *     summary: Get patients by risk level
 *     tags:
 *       - Treatment Tracking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: riskLevel
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - HIGH
 *             - MEDIUM
 *             - LOW
 *     responses:
 *       200:
 *         description: Patients by risk level retrieved successfully
 */
router.get(
    "/risk/:riskLevel/patients",
    authenticate,
    requireNurse,
    treatmentController.getPatientsByRiskLevel
);

/**
 * @swagger
 * /api/treatment-tracking/patients/{patientId}/treatment-detail:
 *   get:
 *     summary: Get patient treatment detail
 *     tags:
 *       - Treatment Tracking
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
 *         description: Patient treatment detail retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get(
    "/patients/:patientId/treatment-detail",
    authenticate,
    requireNurse,
    treatmentController.getPatientTreatmentDetail
);

export default router;