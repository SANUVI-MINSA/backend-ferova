import {Router} from "express";

import {healthFacilityController} from "../dependency-injection/HealthFacilityDependencyInjection"

const router = Router();

/**
 * @swagger
 * /api/health-facilities:
 *   post:
 *     summary: Register a new health facility
 *     tags:
 *       - Health Facilities
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
 */
router.post(
    "/",
    healthFacilityController
        .registerHealthFacility
);

/**
 * @swagger
 * /api/health-facilities/assign-nurse:
 *   post:
 *     summary: Assign nurse to facility
 *     tags:
 *       - Health Facilities
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
 *       404:
 *         description: Facility or nurse not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/health-facilities/appointments:
 *   post:
 *     summary: Book appointment
 *     tags:
 *       - Health Facilities
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
 *               motherId:
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
 *       400:
 *         description: Bad request
 *       404:
 *         description: Facility not found
 *       409:
 *         description: Time slot not available
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/health-facilities/appointments/cancel:
 *   put:
 *     summary: Cancel appointment
 *     tags:
 *       - Health Facilities
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
 *       400:
 *         description: Bad request
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/health-facilities/nearby:
 *   get:
 *     summary: Get nearby health facilities
 *     tags:
 *       - Health Facilities
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
 *       400:
 *         description: Bad request - Missing lat/lng parameters
 *       500:
 *         description: Internal server error
 */

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
 *         description: Health facility detail retrieved successfully
 *       400:
 *         description: Bad request - Invalid facility ID
 *       404:
 *         description: Health facility not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/health-facilities/patient/{patientId}/appointments:
 *   get:
 *     summary: Get patient appointment history
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment history retrieved successfully
 *       400:
 *         description: Bad request - Invalid patient ID
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/health-facilities/appointments/nurse/{nurseId}:
 *   get:
 *     summary: Get confirmed appointment schedule for a nurse
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: nurseId
 *         required: true
 *         schema:
 *           type: string
 *         example: nurse-123
 *     responses:
 *       200:
 *         description: Nurse appointment schedule retrieved successfully
 *       400:
 *         description: Error retrieving nurse appointments
 *       404:
 *         description: Nurse not found
 */

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
 *       400:
 *         description: Bad request
 *       404:
 *         description: Health facility not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/health-facilities/{facilityId}/available-slots",
    healthFacilityController
        .getFacilityAvailableSlots
);

/**
 * @swagger
 * /api/health-facilities/appointments/mother/{motherId}/next:
 *   get:
 *     summary: Get mother's next appointment
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *         example: mother-123
 *     responses:
 *       200:
 *         description: Next appointment retrieved successfully
 *       404:
 *         description: No upcoming appointments found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/assign-nurse",
    healthFacilityController
        .assignNurseToFacility
);

/**
 * @swagger
 * /api/health-facilities/appointments:
 *   post:
 *     summary: Book appointment
 *     tags:
 *       - Health Facilities
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
 *               motherId:
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
 */
router.post(
    "/appointments",
    healthFacilityController
        .bookAppointment
);

/**
 * @swagger
 * /api/health-facilities/appointments/cancel:
 *   put:
 *     summary: Cancel appointment
 *     tags:
 *       - Health Facilities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *       responses:
 *       200:
 *         description: Nearby facilities retrieved successfully
 */
router.put(
    "/appointments/cancel",
    healthFacilityController
        .cancelAppointment
);

/**
 * @swagger
 * /api/health-facilities/nearby:
 *   get:
 *     summary: Get nearby health facilities
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         example: -12.0464
 *
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         example: -77.0428
 *
 *     responses:
 *       200:
 *         description: Nearby facilities retrieved successfully
 */
router.get(
    "/nearby",
    healthFacilityController
        .listHealthFacilities
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
    healthFacilityController
        .getHealthFacilityDetail
);

/**
 * @swagger
 * /api/health-facilities/patient/{patientId}/appointments:
 *   get:
 *     summary: Get patient appointment history
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment history retrieved
 */
router.get(
    "/patient/:patientId/appointments",
    healthFacilityController
        .getPatientAppointmentHistory
);

/**
 * @swagger
 * /api/health-facilities/appointments/nurse/{nurseId}:
 *   get:
 *     summary: Get confirmed appointment schedule for a nurse
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: nurseId
 *         required: true
 *         schema:
 *           type: string
 *         example: nurse-123
 *     responses:
 *       200:
 *         description: Nurse appointment schedule retrieved successfully
 *       400:
 *         description: Error retrieving nurse appointments
 */
router.get(
    "/appointments/nurse/:nurseId",
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
    healthFacilityController
        .getFacilityAvailableSlots
);

/**
 * @swagger
 * /api/health-facilities/appointments/mother/{motherId}/next:
 *   get:
 *     summary: Get mother's next appointment
 *     tags:
 *       - Health Facilities
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *         example: mother-123
 *     responses:
 *       200:
 *         description: Next appointment retrieved successfully
 *       404:
 *         description: No upcoming appointments found
 */
router.get(
    "/appointments/mother/:motherId/next",
    healthFacilityController
        .getMotherNextAppointment
);
export default router;