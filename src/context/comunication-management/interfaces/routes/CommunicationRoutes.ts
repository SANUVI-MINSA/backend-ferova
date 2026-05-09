import { Router } from "express";
import {communicationController} from "../dependencies/ComunicationDependecies";

const router = Router();

/**
 * @swagger
 * /api/communication/consultations:
 *   post:
 *     summary: Start a new consultation
 *     tags:
 *       - Communication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motherId
 *               - patientId
 *               - firstMessageContent
 *             properties:
 *               motherId:
 *                 type: string
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
    communicationController.startConsultation
);

/**
 * @swagger
 * /api/communication/messages:
 *   post:
 *     summary: Add new message to consultation
 *     tags:
 *       - Communication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultationId
 *               - senderId
 *               - senderRole
 *               - content
 *             properties:
 *               consultationId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               senderRole:
 *                 type: string
 *                 example: MOTHER
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post(
    "/messages",
    communicationController.addMessage
);

/**
 * @swagger
 * /api/communication/consultations/close:
 *   delete:
 *     summary: Close consultation
 *     tags:
 *       - Communication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultationId
 *               - nurseId
 *             properties:
 *               consultationId:
 *                 type: string
 *               nurseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consultation closed successfully
 *       400:
 *         description: Validation error
 */
router.delete(
    "/consultations/close",
    communicationController.closeConsultation
);

/**
 * @swagger
 * /api/communication/patients/{motherId}:
 *   get:
 *     summary: Get patients with nurse assignment
 *     tags:
 *       - Communication
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 */
router.get(
    "/patients/:motherId",
    communicationController
        .getPatientsWithNurseAssignment
);

/**
 * @swagger
 * /api/communication/nurse-info/{patientId}:
 *   get:
 *     summary: Get nurse info for consultation
 *     tags:
 *       - Communication
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nurse info retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get(
    "/nurse-info/:patientId",
    communicationController
        .getNurseInfoForConsultation
);

/**
 * @swagger
 * /api/communication/chat/{consultationId}:
 *   get:
 *     summary: Get consultation chat
 *     tags:
 *       - Communication
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: requesterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat retrieved successfully
 *       403:
 *         description: Not authorized
 */
router.get(
    "/chat/:consultationId",
    communicationController
        .getConsultationChat
);

/**
 * @swagger
 * /api/communication/mother/{motherId}/consultations:
 *   get:
 *     summary: Get mother consultations
 *     tags:
 *       - Communication
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mother consultations retrieved successfully
 */
router.get(
    "/mother/:motherId/consultations",
    communicationController
        .getOpenConsultationsByMother
);


/**
 * @swagger
 * /api/communication/nurse/{nurseId}/consultations:
 *   get:
 *     summary: Get nurse consultations
 *     tags:
 *       - Communication
 *     parameters:
 *       - in: path
 *         name: nurseId
 *         required: true
 *         schema:
 *           type: string
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
    "/nurse/:nurseId/consultations",
    communicationController
        .getOpenConsultationsByNurse
);

/**
 * @swagger
 * /api/communication/chat/{consultationId}/messages/after:
 *   get:
 *     summary: Get messages after timestamp
 *     tags:
 *       - Communication
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: requesterId
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
 *       403:
 *         description: Not authorized
 */
router.get(
    "/chat/:consultationId/messages/after",
    communicationController
        .getMessagesAfter
);

export default router;