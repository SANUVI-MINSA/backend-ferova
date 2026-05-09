import express from "express";

import { patientManagementController } from "../dependencies/PatientManagementDependencyInjection";
import {authenticate, requireMother, requireNurse} from "../../../../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/patients/register:
 *   post:
 *     summary: Register a new patient
 *     tags:
 *       - Patients
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
 *                 example: Mateo
 *               lastName:
 *                 type: string
 *                 example: Perez
 *               birthDate:
 *                 type: string
 *                 example: 2023-05-10
 *               gender:
 *                 type: string
 *                 example: MALE
 *               weight:
 *                 type: number
 *                 example: 12.5
 *               height:
 *                 type: number
 *                 example: 85
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Patient already exists
 *       500:
 *         description: Internal server error
 */
router.post(
    "/register",
    authenticate,
    requireMother,  // ✅ Solo madres autenticadas
    patientManagementController.registerPatient
);

/**
 * @swagger
 * /api/patients/assign-nurse:
 *   post:
 *     summary: Assign patient to nurse
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nurse assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 patientId:
 *                   type: string
 *                 nurseId:
 *                   type: string
 *       404:
 *         description: Patient or nurse not found
 *       400:
 *         description: Invalid input or patient already assigned
 *       500:
 *         description: Internal server error
 */
router.post(
    "/assign-nurse",
    authenticate,
    requireNurse,
    patientManagementController.assignPatientToNurse
);

/**
 * @swagger
 * /api/patients/medical-record:
 *   post:
 *     summary: Create initial medical record
 *     tags:
 *       - Patients
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
 *               - weight
 *               - height
 *               - motivoConsulta
 *               - observaciones    // ✅ Ahora es requerido
 *             properties:
 *               patientId:
 *                 type: string
 *               weight:
 *                 type: number
 *                 example: 12.5
 *               height:
 *                 type: number
 *                 example: 85
 *               motivoConsulta:
 *                 type: string
 *                 example: "Control de rutina"
 *               observaciones:
 *                 type: string
 *                 example: "Paciente en buen estado general"
 *               antecedentes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *                 example: [{"type": "alergia", "description": "Penicilina"}]
 *               sintomas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["fiebre", "tos"]
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Patient not found
 *       409:
 *         description: Medical record already exists for this patient
 */
router.post(
    "/medical-record",
    authenticate,
    requireNurse,
    patientManagementController.createMedicalRecord
);

/**
 * @swagger
 * /api/patients/hemoglobin-control:
 *   post:
 *     summary: Register hemoglobin control
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               hemoglobinLevel:
 *                 type: number
 *     responses:
 *       201:
 *         description: Hemoglobin control registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 message:
 *                   type: string
 *                 hemoglobinLevel:
 *                   type: number
 *                 registeredAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input data (hemoglobin level out of range)
 *       404:
 *         description: Patient or medical record not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/hemoglobin-control",
    authenticate,
    requireNurse,
    patientManagementController.registerHemoglobinControl
);

// En PatientManagementRoutes.ts
/**
 * @swagger
 * /api/patients/medical-record/update:
 *   put:
 *     summary: Update medical record
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "patient-123"
 *               weight:
 *                 type: number
 *                 example: 13.2
 *               height:
 *                 type: number
 *                 example: 88
 *               motivoConsulta:
 *                 type: string
 *                 example: "Control de crecimiento"
 *               observaciones:
 *                 type: string
 *                 example: "Paciente con buen apetito"
 *               antecedentes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *                 example: [{"type": "alergia", "description": "Ninguna"}]
 *               sintomas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ninguno"]
 *             required:
 *               - patientId
 *     responses:
 *       200:
 *         description: Medical record updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Medical record not found
 */
router.put(
    "/medical-record/update",
    authenticate,
    requireNurse,
    patientManagementController.updateMedicalRecord
);

/**
 * @swagger
 * /api/patients/discharge:
 *   put:
 *     summary: Discharge patient
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient discharged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 patientId:
 *                   type: string
 *                 dischargedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Patient not eligible for discharge or invalid input
 *       404:
 *         description: Patient or nurse not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/discharge",
    authenticate,
    requireNurse,
    patientManagementController.dischargePatient
);

/**
 * @swagger
 * /api/patients/mother/search/{dni}:
 *   get:
 *     summary: Search mother by DNI
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *         example: 76543210
 *     responses:
 *       200:
 *         description: Mother found successfully
 *       404:
 *         description: Mother not found
 */
router.get(
    "/mother/search/:dni",
    patientManagementController
        .searchMotherByDni
);

/**
 * @swagger
 * /api/patients/mother/{motherId}:
 *   get:
 *     summary: List patients by mother
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 motherId:
 *                   type: string
 *                 patients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       birthDate:
 *                         type: string
 *                         format: date
 *                       gender:
 *                         type: string
 *                       active:
 *                         type: boolean
 *       404:
 *         description: Mother not found or no patients found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/mother/:motherId",
    patientManagementController.listPatientsByMother
);

/**
 * @swagger
 * /api/patients/{patientId}/medical-record:
 *   get:
 *     summary: Get medical record
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 patientId:
 *                   type: string
 *                 weight:
 *                   type: number
 *                 height:
 *                   type: number
 *                 motivoConsulta:
 *                   type: string
 *                 observaciones:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Medical record not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:patientId/medical-record",
    patientManagementController.getMedicalRecord
);

/**
 * @swagger
 * /api/patients/medical-record/{medicalRecordId}/controls:
 *   get:
 *     summary: Get hemoglobin controls history
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: medicalRecordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hemoglobin controls history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 medicalRecordId:
 *                   type: string
 *                 controls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       hemoglobinLevel:
 *                         type: number
 *                       registeredAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Medical record not found or no controls registered
 *       500:
 *         description: Internal server error
 */
router.get(
    "/medical-record/:medicalRecordId/controls",
    patientManagementController.getHemoglobinHistory
);

/**
 * @swagger
 * /api/patients/discharge/nurse/{nurseId}:
 *   get:
 *     summary: Get patients eligible for discharge
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: nurseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Eligible patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nurseId:
 *                   type: string
 *                 eligiblePatients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       admissionDate:
 *                         type: string
 *                         format: date
 *                       lastHemoglobinLevel:
 *                         type: number
 *       404:
 *         description: Nurse not found or no eligible patients
 *       500:
 *         description: Internal server error
 */
router.get(
    "/discharge/nurse/:nurseId",
    patientManagementController.getEligiblePatientsForDischarge
);

/**
 * @swagger
 * /api/patients/medical-record/{medicalRecordId}/pdf:
 *   get:
 *     summary: Download medical record PDF
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: medicalRecordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Medical record not found
 *       500:
 *         description: Internal server error or PDF generation failed
 */
router.get(
    "/medical-record/:medicalRecordId/pdf",
    patientManagementController.downloadMedicalRecordPdf
);

/**
 * @swagger
 * /api/patients/medical-record/{medicalRecordId}/hemoglobin-report:
 *   get:
 *     summary: Download hemoglobin report PDF
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: medicalRecordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF report generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Medical record or hemoglobin controls not found
 *       500:
 *         description: Internal server error or PDF generation failed
 */
router.get(
    "/medical-record/:medicalRecordId/hemoglobin-report",
    patientManagementController.downloadHemoglobinReportPdf
);


/**
 * @swagger
 * /api/patients/nurse/{nurseId}:
 *   get:
 *     summary: Get patients assigned to a nurse
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: nurseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assigned patients retrieved successfully
 *       404:
 *         description: No patients found
 */
router.get(
    "/nurse/:nurseId",
    patientManagementController
        .getPatientsAssignedToNurse
);

/**
 * @swagger
 * /api/patients/{patientId}/hemoglobin-evolution:
 *   get:
 *     summary: Get hemoglobin evolution chart
 *     tags:
 *       - Patients
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
 *         description: Hemoglobin evolution retrieved successfully
 */
router.get(
    "/:patientId/hemoglobin-evolution",
    authenticate,
    requireMother,  // ✅ Solo madres, con validación de pertenencia
    patientManagementController.getHemoglobinEvolutionChart
);

export default router;