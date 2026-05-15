import { Request, Response } from "express";
import {PatientManagementFacade} from "./facade/PatientManagementFacade";
import {HemoglobinHistoryResourceAssembler} from "./assemblers/HemoglobinHistoryResourceAssembler";
import {EligibleDischargePatientResourceAssembler} from "./assemblers/EligibleDischargePatientResourceAssembler";
import {AuthRequest} from "../../../middlewares/auth.middleware";

export class PatientManagementController {

    constructor(
        private patientFacade:
        PatientManagementFacade
    ) {}

    registerPatient = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            // ✅ Sobrescribir motherId del body con la del token
            const command = {
                ...req.body,
                motherId  // ← Forzar motherId del token
            };

            await this.patientFacade.registerPatient(command);

            res.status(201).json({
                message: "Patient registered successfully"
            });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    assignPatientToNurse = async (req: AuthRequest, res: Response) => {
        try {
            // ✅ Obtener nurseId del token
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const { patientId } = req.body;

            if (!patientId) {
                return res.status(400).json({ error: "Patient ID es requerido" });
            }

            // ✅ Usar nurseId del token, no del body
            const command = { patientId, nurseId };

            await this.patientFacade.assignPatientToNurse(command);

            res.status(200).json({ message: "Patient assigned successfully" });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    createMedicalRecord = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const { patientId, weight, height, motivoConsulta, observaciones, antecedentes, sintomas } = req.body;

            if (!patientId || !weight || !height || !motivoConsulta || !observaciones) {
                return res.status(400).json({
                    error: "Faltan campos requeridos: patientId, weight, height, motivoConsulta, observaciones"
                });
            }

            // ✅ Verificar que el paciente esté asignado a esta enfermera
            await this.patientFacade.validateNurseHasPatient(nurseId, patientId);

            const command = { patientId, weight, height, motivoConsulta, observaciones, antecedentes, sintomas };

            await this.patientFacade.createInitialMedicalRecord(command);

            res.status(201).json({ message: "Medical record created successfully" });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };


    registerHemoglobinControl = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const { patientId, hemoglobinLevel } = req.body;

            if (!patientId || hemoglobinLevel === undefined) {
                return res.status(400).json({ error: "Faltan campos: patientId, hemoglobinLevel" });
            }

            // ✅ Verificar que el paciente esté asignado a esta enfermera
            await this.patientFacade.validateNurseHasPatient(nurseId, patientId);

            const command = { patientId, hemoglobinLevel };

            await this.patientFacade.registerHemoglobinControl(command);

            res.status(200).json({ message: "Hemoglobin control registered successfully" });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    updateMedicalRecord = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const { patientId, weight, height, motivoConsulta, observaciones, antecedentes, sintomas } = req.body;

            if (!patientId) {
                return res.status(400).json({ error: "Patient ID es requerido" });
            }

            // ✅ Verificar que el paciente esté asignado a esta enfermera
            await this.patientFacade.validateNurseHasPatient(nurseId, patientId);

            const command = { patientId, weight, height, motivoConsulta, observaciones, antecedentes, sintomas };

            await this.patientFacade.updateMedicalRecord(command);

            res.status(200).json({ message: "Medical record updated successfully" });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    dischargePatient = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const { patientId } = req.body;

            if (!patientId) {
                return res.status(400).json({ error: "Patient ID es requerido" });
            }

            // ✅ Verificar que el paciente esté asignado a esta enfermera
            await this.patientFacade.validateNurseHasPatient(nurseId, patientId);

            const command = { patientId, nurseId };

            await this.patientFacade.dischargePatient(command);

            res.status(200).json({ message: "Patient discharged successfully" });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    listPatientsByMother = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const motherId = req.params.motherId as string;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID es requerido" });
            }

            // ✅ Verificar que la enfermera tiene pacientes asociados a esta madre
            // (opcional: agregar validación si es necesario)

            const patients = await this.patientFacade.listPatientsByMother({ motherId });

            res.status(200).json(patients);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getMedicalRecord = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const patientId = req.params.patientId as string;

            if (!patientId) {
                return res.status(400).json({ error: "Patient ID es requerido" });
            }

            // ✅ Validar que el paciente está asignado a esta enfermera
            await this.patientFacade.validateNurseHasPatient(nurseId, patientId);

            const data = await this.patientFacade.getMedicalRecord({ patientId });

            res.status(200).json(data);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getHemoglobinHistory = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const medicalRecordId = req.params.medicalRecordId as string;

            if (!medicalRecordId) {
                return res.status(400).json({ error: "Medical Record ID es requerido" });
            }

            // ✅ Validar que la enfermera tiene acceso a esta historia clínica
            await this.patientFacade.validateNurseHasAccessToMedicalRecord(nurseId, medicalRecordId);

            const history = await this.patientFacade.getHemoglobinControlsHistory({ medicalRecordId });

            res.status(200).json(HemoglobinHistoryResourceAssembler.toResource(history));

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getEligiblePatientsForDischarge = async (req: AuthRequest, res: Response) => {
        try {
            // ✅ Obtener nurseId del token, no de params
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const patients = await this.patientFacade.getPatientsEligibleForDischarge({ nurseId });

            res.status(200).json(patients);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    downloadMedicalRecordPdf = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const medicalRecordId = req.params.medicalRecordId as string;

            if (!medicalRecordId) {
                return res.status(400).json({ error: "Medical Record ID es requerido" });
            }

            // ✅ Validar que la enfermera tiene acceso a esta historia clínica
            await this.patientFacade.validateNurseHasAccessToMedicalRecord(nurseId, medicalRecordId);

            const pdf = await this.patientFacade.downloadMedicalRecordPdf({ medicalRecordId });

            res.setHeader("Content-Disposition", "attachment; filename=medical-record.pdf");
            res.send(pdf);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    downloadHemoglobinReportPdf = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const medicalRecordId = req.params.medicalRecordId as string;

            if (!medicalRecordId) {
                return res.status(400).json({ error: "Medical Record ID es requerido" });
            }

            // ✅ Validar que la enfermera tiene acceso a esta historia clínica
            await this.patientFacade.validateNurseHasAccessToMedicalRecord(nurseId, medicalRecordId);

            const pdf = await this.patientFacade.downloadHemoglobinReportPdf({ medicalRecordId });

            res.setHeader("Content-Disposition", "attachment; filename=hemoglobin-report.pdf");
            res.send(pdf);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    searchMotherByDni = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const dni = req.params.dni as string;

            if (!dni) {
                return res.status(400).json({ error: "DNI es requerido" });
            }

            const mother = await this.patientFacade.searchMotherByDni({ dni });

            res.status(200).json(mother);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getPatientsAssignedToNurse = async (req: AuthRequest, res: Response) => {
        try {
            // ✅ Obtener nurseId del token, no de params
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const patients = await this.patientFacade.getPatientsAssignedToNurse({ nurseId });

            res.status(200).json(patients);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getHemoglobinEvolutionChart = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;
            const patientId = req.params.patientId as string;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado" });
            }

            // ✅ Usar el nuevo método de validación
            await this.patientFacade.validatePatientBelongsToMother(patientId, motherId);

            const result = await this.patientFacade.getHemoglobinEvolutionChart({ patientId });

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getActivePatientsCount = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const count = await this.patientFacade.getActivePatientsCount({ nurseId });

            res.status(200).json({
                nurseId,
                activePatientsCount: count
            });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getMyPatients = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const patients = await this.patientFacade.getMotherPatientsSummary({ motherId });

            res.status(200).json({
                motherId,
                patients
            });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}