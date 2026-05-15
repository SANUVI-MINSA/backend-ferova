import { Router } from "express";
import {communicationController} from "../dependencies/ComunicationDependecies";
import {authenticate, requireMother, requireMotherOrNurse, requireNurse} from "../../../../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/communication/consultations:
 *   post:
 *     summary: Start a new consultation only mother
 *     tags:
 *       - Communication
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
 *               - firstMessageContent
 *             properties:
 *               patientId:
 *                 type: string
 *               firstMessageContent:
 *                 type: string
 *     responses:
 *       201:
 *         description: Consultation created successfully
 */
router.post(
    "/consultations",
    authenticate,
    requireMother,  // ✅ Solo madres
    communicationController.startConsultation
);


/**
 * @swagger
 * /api/communication/messages:
 *   post:
 *     summary: Add new message to consultation only mother - nurse
 *     tags:
 *       - Communication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultationId
 *               - content
 *             properties:
 *               consultationId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post(
    "/messages",
    authenticate,
    requireMotherOrNurse,  // ✅ Madres y enfermeros
    communicationController.addMessage
);

/**
 * @swagger
 * /api/communication/consultations/close:
 *   delete:
 *     summary: Close consultation only nurse
 *     tags:
 *       - Communication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultationId
 *             properties:
 *               consultationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consultation closed successfully
 */
router.delete(
    "/consultations/close",
    authenticate,
    requireNurse,  // ✅ Solo enfermeros
    communicationController.closeConsultation
);

/**
 * @swagger
 * /api/communication/patients:
 *   get:
 *     summary: Get patients with nurse assignment (for mother)
 *     tags:
 *       - Communication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 */
router.get(
    "/patients",
    authenticate,
    requireMother,  // ✅ Solo madres
    communicationController.getPatientsWithNurseAssignment
);

/**
 * @swagger
 * /api/communication/nurse-info/{patientId}:
 *   get:
 *     summary: Get nurse info for consultation only mother
 *     tags:
 *       - Communication
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
 *         description: Nurse info retrieved successfully
 */
router.get(
    "/nurse-info/:patientId",
    authenticate,
    requireMother,  // ✅ Solo madres
    communicationController.getNurseInfoForConsultation
);

/**
 * @swagger
 * /api/communication/chat/{consultationId}:
 *   get:
 *     summary: Get consultation chat only mother and nurse
 *     tags:
 *       - Communication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat retrieved successfully
 */
router.get(
    "/chat/:consultationId",
    authenticate,
    requireMotherOrNurse,  // ✅ Madres y enfermeros
    communicationController.getConsultationChat
);


/**
 * @swagger
 * /api/communication/consultations/mother:
 *   get:
 *     summary: Get mother consultations only mother
 *     tags:
 *       - Communication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mother consultations retrieved successfully
 */
router.get(
    "/consultations/mother",
    authenticate,
    requireMother,  // ✅ Solo madres
    communicationController.getOpenConsultationsByMother
);

/**
 * @swagger
 * /api/communication/consultations/nurse:
 *   get:
 *     summary: Get nurse consultations only nurse
 *     tags:
 *       - Communication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nurse consultations retrieved successfully
 */
router.get(
    "/consultations/nurse",
    authenticate,
    requireNurse,  // ✅ Solo enfermeros
    communicationController.getOpenConsultationsByNurse
);

/**
 * @swagger
 * /api/communication/chat/{consultationId}/messages/after:
 *   get:
 *     summary: Get messages after timestamp only mother and nurses
 *     tags:
 *       - Communication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: afterTimestamp
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get(
    "/chat/:consultationId/messages/after",
    authenticate,
    requireMotherOrNurse,  // ✅ Madres y enfermeros
    communicationController.getMessagesAfter
);

export default router;