import {Router} from "express";

import {healthFacilityController} from "../dependency-injection/HealthFacilityDependencyInjection"
import {authenticate, requireAdmin, requireMother, requireNurse} from "../../../../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/health-facilities:
 *   post:
 *     summary: Register a new health facility
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Posta Ate
 *               address:
 *                 type: string
 *                 example: Av Los Olivos 123
 *               districtId:
 *                 type: string
 *                 example: DIST001
 *               latitude:
 *                 type: number
 *                 example: -12.0464
 *               longitude:
 *                 type: number
 *                 example: -77.0428
 *               phoneNumber:
 *                 type: string
 *                 example: 987654321
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Vaccination
 *                   - Pediatrics
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Monday
 *                   - Tuesday
 *               availableSlots:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 09:00
 *                   - 10:00
 *     responses:
 *       201:
 *         description: Health facility registered successfully
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post(
    "/",
    authenticate,
    requireAdmin,
    healthFacilityController.registerHealthFacility
);

/**
 * @swagger
 * /api/health-facilities/assign-nurse:
 *   post:
 *     summary: Assign nurse to facility
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityId:
 *                 type: string
 *               nurseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nurse assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Facility or nurse not found
 */
router.post(
    "/assign-nurse",
    authenticate,
    requireAdmin,
    healthFacilityController.assignNurseToFacility
);

/**
 * @swagger
 * /api/health-facilities/appointments:
 *   post:
 *     summary: Book appointment
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityId:
 *                 type: string
 *               patientId:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 example: 2026-06-10
 *               appointmentTime:
 *                 type: string
 *                 example: 09:00
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Forbidden - Mother role required
 */
router.post(
    "/appointments",
    authenticate,
    requireMother,
    healthFacilityController.bookAppointment
);

/**
 * @swagger
 * /api/health-facilities/appointments/cancel:
 *   put:
 *     summary: Cancel appointment
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Forbidden - Mother role required
 */
router.put(
    "/appointments/cancel",
    authenticate,
    requireMother,
    healthFacilityController.cancelAppointment
);

/**
 * @swagger
 * /api/health-facilities/nearby:
 *   get:
 *     summary: Get nearby health facilities (Solo Madre)
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         example: -12.0464
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         example: -77.0428
 *     responses:
 *       200:
 *         description: Nearby facilities retrieved successfully
 */
router.get(
    "/nearby",
    authenticate,
    requireMother,
    healthFacilityController.listHealthFacilities
);

/**
 * @swagger
 * /api/health-facilities/districts:
 *   get:
 *     summary: List all districts for dropdown
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of districts retrieved successfully
 */
router.get(
    "/districts",
    authenticate,
    requireAdmin,
    healthFacilityController.listDistricts
);

/**
 * @swagger
 * /api/health-facilities/{id}:
 *   get:
 *     summary: Get health facility detail
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health facility detail retrieved
 */
router.get(
    "/:id",
    healthFacilityController.getHealthFacilityDetail
);

/**
 * @swagger
 * /api/health-facilities/patient/{patientId}/appointments:
 *   get:
 *     summary: Get patient appointment history (SOLO MADRE)
 *     tags:
 *       - Health Facilities
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
 *         description: Appointment history retrieved
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Forbidden - Patient does not belong to mother
 */
router.get(
    "/patient/:patientId/appointments",
    authenticate,
    requireMother,
    healthFacilityController.getPatientAppointmentHistory
);

/**
 * @swagger
 * /api/health-facilities/appointments/nurse:
 *   get:
 *     summary: Get confirmed appointment schedule for a nurse
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nurse appointment schedule retrieved successfully
 *       400:
 *         description: Error retrieving nurse appointments
 */
router.get(
    "/appointments/nurse",
    authenticate,
    requireNurse,
    healthFacilityController
        .getNurseAppointmentSchedule
);

/**
 * @swagger
 * /api/health-facilities/{facilityId}/available-slots:
 *   get:
 *     summary: Get available appointment slots for a health facility
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         example: 2026-06-20
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 */
router.get(
    "/:facilityId/available-slots",
    healthFacilityController.getFacilityAvailableSlots
);

/**
 * @swagger
 * /api/health-facilities/nurses/unassigned:
 *   get:
 *     summary: List all unassigned nurses (available for facility assignment)
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unassigned nurses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       fullName:
 *                         type: string
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get(
    "/nurses/unassigned",
    authenticate,
    requireAdmin,
    healthFacilityController.listUnassignedNurses
);

/**
 * @swagger
 * /api/health-facilities/appointments/mother/next:
 *   get:
 *     summary: Get mother's next appointment (motherId from token)
 *     tags:
 *       - Health Facilities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Next appointment retrieved successfully
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: No upcoming appointments found
 */
router.get(
    "/appointments/mother/next",
    authenticate,
    requireMother,
    healthFacilityController.getMotherNextAppointment
);

export default router;