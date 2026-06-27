import {randomUUID} from "node:crypto";
import {PatientCommandService} from "../../domain/services/PatientCommandService";
import {PatientRepository} from "../../domain/repositories/PatientRepository";
import {MedicalRecordRepository} from "../../domain/repositories/MedicalRecordRepository";
import {AssignPatientToNurseCommand} from "../../domain/model/commands/AssignPatientToNurseCommand";
import {CreateInitialMedicalRecordCommand} from "../../domain/model/commands/CreateInitialMedicalRecordCommand";
import {DischargePatientCommand} from "../../domain/model/commands/DischargePatientCommand";
import {RegisterHemoglobinControlCommand} from "../../domain/model/commands/RegisterHemoglobinControlCommand";
import {RegisterPatientCommand} from "../../domain/model/commands/RegisterPatientCommand";
import {UpdateMedicalRecordCommand} from "../../domain/model/commands/UpdateMedicalRecordCommand";
import {Patient} from "../../domain/model/aggregate/Patient";
import {BirthDate} from "../../domain/model/value-objects/BirthDate";
import {Weight} from "../../domain/model/value-objects/Weight";
import {Height} from "../../domain/model/value-objects/Height";
import {Gender} from "../../domain/model/enum/Gender";
import {PatientStatus} from "../../domain/model/enum/PatientStatus";
import {Observaciones} from "../../domain/model/value-objects/Observaciones";
import {MotivoConsulta} from "../../domain/model/value-objects/MotivoConsulta";
import {MedicalRecord} from "../../domain/model/entities/MedicalRecord";
import {HemoglobinLevel} from "../../domain/model/value-objects/HemoglobinLevel";
import {Control} from "../../domain/model/entities/Control";
import {NurseAssignmentRepository} from "../../../Healthy-Facility/domain/repositories/NurseAssignmentRepository";
import {Antecedente} from "../../domain/model/value-objects/Antecedente";
import {TreatmentRepository} from "../../../treatment-tracking/model/repositories/TreatmentRepository";
import {DailyDoseRepository} from "../../../treatment-tracking/model/repositories/DailyDoseRepository";
import {AchievementRepository} from "../../../achievements-rewards/domain/repositories/AchievementRepository";
import {BadgeRepository} from "../../../achievements-rewards/domain/repositories/BadgeRepository";
import {ConsultationRepository} from "../../../comunication-management/domain/repositories/ConsultationRepository";

export class PatientCommandServiceImpl implements PatientCommandService {

    constructor(
        private patientRepository: PatientRepository,
        private medicalRecordRepository: MedicalRecordRepository,
        private nurseAssignmentRepository: NurseAssignmentRepository,
        private treatmentRepository: TreatmentRepository,
        private dailyDoseRepository: DailyDoseRepository,
        // ✅ Inyectar repositorios de achievements
        private achievementRepository: AchievementRepository,
        private badgeRepository: BadgeRepository,
        // ✅ Inyectar repositorio de consultas
        private consultationRepository: ConsultationRepository
    ) {
    }

    async assignPatientToNurse(
        command: AssignPatientToNurseCommand
    ): Promise<void> {

        const patient =
            await this
                .patientRepository
                .findById(
                    command.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        const assignment =
            await this
                .nurseAssignmentRepository
                .findByNurseId(
                    command.nurseId
                );

        if (!assignment) {
            throw new Error(
                "Nurse is not assigned to any facility"
            );
        }

        const assignmentData =
            assignment.toPrimitives();

        // ✅ Verificar si ya está asignado al mismo enfermero
        const patientData = patient.toPrimitives();
        const currentNurseId = patientData.nurseId;

        if (currentNurseId === command.nurseId) {
            console.log(`[assignPatientToNurse] Patient ${command.patientId} already assigned to nurse ${command.nurseId}`);
            return;
        }

        // ✅ Solo asigna el paciente al nuevo enfermero (NO elimina tratamientos)
        patient.assignNurse(
            command.nurseId,
            assignmentData.facilityId
        );

        await this
            .patientRepository
            .update(patient);
    }

    async createInitialMedicalRecord(
        command: CreateInitialMedicalRecordCommand
    ): Promise<void> {
        const patient = await this.patientRepository.findById(command.patientId);

        if (!patient) {
            throw new Error("Patient not found");
        }

        const existingRecord = await this.medicalRecordRepository.findByPatientId(command.patientId);

        if (existingRecord) {
            throw new Error("Medical record already exists");
        }

        const medicalRecord = new MedicalRecord(
            randomUUID(),
            new Date(),
            new Date(),
            null,
            new Weight(command.weight),
            new Height(command.height),
            patient.toPrimitives().gender,
            (command.antecedentes || []).map(
                (antecedente: any) =>
                    new Antecedente(
                        antecedente.type,
                        antecedente.description
                    )
            ),
            new MotivoConsulta(command.motivoConsulta),
            new Observaciones(command.observaciones),  // ✅ Ya no es opcional
            command.sintomas || [],
            [],
            command.patientId,
            patient.toPrimitives().nurseId
        );

        await this.medicalRecordRepository.save(medicalRecord);
    }

    async dischargePatient(
        command:
        DischargePatientCommand
    ): Promise<void> {

        const patient =
            await this
                .patientRepository
                .findById(
                    command.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        // Validar que la enfermera asignada sea la que da de alta
        patient.discharge(
            command.nurseId
        );

        // ELIMINAR TODOS los tratamientos y dosis del paciente al dar de alta
        await this.deleteAllTreatmentsForPatient(command.patientId);

        // ELIMINAR CONSULTA ACTIVA DEL PACIENTE
        await this.deleteConsultationsForPatient(command.patientId);

        // ELIMINAR MEDICAL RECORD DEL PACIENTE
        await this.deleteMedicalRecordForPatient(command.patientId);

        await this
            .patientRepository.
            update(patient);
    }

    async registerHemoglobinControl(
        command:
        RegisterHemoglobinControlCommand
    ): Promise<void> {

        const medicalRecord =
            await this
                .medicalRecordRepository
                .findByPatientId(
                    command.patientId
                );

        if (!medicalRecord) {
            throw new Error(
                "Medical record not found"
            );
        }

        const control =
            new Control(
                randomUUID(),
                new Date(),
                new HemoglobinLevel(
                    command.hemoglobinLevel
                )
            );

        medicalRecord.addControl(
            control
        );

        await this
            .medicalRecordRepository
            .update(
                medicalRecord
            );
    }

    async registerPatient(
        command: RegisterPatientCommand
    ): Promise<void> {

        const patient =
            new Patient(
                randomUUID(),
                command.name,
                command.lastName,
                new BirthDate(
                    command.birthDate
                ),
                new Weight(
                    command.weight
                ),
                new Height(
                    command.height
                ),
                command.motherId,
                null,
                command.gender as Gender,
                null,
                PatientStatus.ACTIVE
            );

        await this
            .patientRepository
            .save(patient);
    }

    // En PatientCommandServiceImpl.ts
    async updateMedicalRecord(
        command: UpdateMedicalRecordCommand
    ): Promise<void> {

        const medicalRecord = await this.medicalRecordRepository
            .findByPatientId(command.patientId);

        if (!medicalRecord) {
            throw new Error("Medical record not found");
        }

        // Preparar valores solo si existen en el comando
        const weight = command.weight !== undefined
            ? new Weight(command.weight)
            : undefined;

        const height = command.height !== undefined
            ? new Height(command.height)
            : undefined;

        const motivoConsulta = command.motivoConsulta !== undefined
            ? new MotivoConsulta(command.motivoConsulta)
            : undefined;

        const observaciones = command.observaciones !== undefined
            ? new Observaciones(command.observaciones)
            : undefined;

        const antecedentes = command.antecedentes !== undefined
            ? command.antecedentes.map(ante => new Antecedente(ante.type, ante.description))
            : undefined;

        const sintomas = command.sintomas;

        medicalRecord.updateClinicalInformation(
            weight,
            height,
            motivoConsulta,
            observaciones,
            antecedentes,
            sintomas
        );

        await this.medicalRecordRepository.update(medicalRecord);
    }

    /**
     * ✅ ELIMINA completamente TODOS los tratamientos y dosis de un paciente
     * (Se usa al dar de alta al paciente)
     */
    private async deleteAllTreatmentsForPatient(patientId: string): Promise<void> {
        try {
            // ✅ Buscar TODOS los tratamientos del paciente (ACTIVE, COMPLETED, ABANDONED)
            const treatments = await this.treatmentRepository.findByPatientId(patientId);

            if (treatments.length === 0) {
                console.log(`[deleteAllTreatmentsForPatient] No treatments found for patient ${patientId}`);
                return;
            }

            console.log(`[deleteAllTreatmentsForPatient] Found ${treatments.length} treatment(s) for patient ${patientId}`);

            for (const treatment of treatments) {
                const treatmentId = treatment.getId();
                const status = treatment.getStatus();
                console.log(`[deleteAllTreatmentsForPatient] Processing treatment ${treatmentId} with status: ${status}`);

                // 1. Obtener todas las dosis del tratamiento
                const doses = await this.dailyDoseRepository.findByTreatmentId(treatmentId);
                const doseIds = doses.map(dose => dose.getId());

                // 2. ELIMINAR dosis
                if (doseIds.length > 0) {
                    await this.dailyDoseRepository.deleteMany(doseIds);
                    console.log(`[deleteAllTreatmentsForPatient] DELETED ${doseIds.length} doses for treatment ${treatmentId}`);
                }

                // 3. ✅ ELIMINAR Achievement y Badges asociados al tratamiento
                await this.deleteAchievementAndBadgesForTreatment(treatmentId);


                // 4. ELIMINAR el tratamiento (sin importar su estado)
                await this.treatmentRepository.delete(treatmentId);
                console.log(`[deleteAllTreatmentsForPatient] DELETED treatment ${treatmentId} (was ${status})`);
            }

            console.log(`[deleteAllTreatmentsForPatient] All treatments deleted for patient ${patientId}`);

        } catch (error) {
            console.error(`[deleteAllTreatmentsForPatient] Error deleting treatments for patient ${patientId}:`, error);
            // No lanzamos el error para no interrumpir el alta
        }
    }

    /**
     * ✅ Elimina Achievement y Badges asociados a un tratamiento
     */
    private async deleteAchievementAndBadgesForTreatment(treatmentId: string): Promise<void> {
        try {
            // Buscar achievement por treatmentId
            const achievement = await this.achievementRepository.findByTreatmentId(treatmentId);

            if (achievement) {
                const achievementId = achievement.getId();
                console.log(`[deleteAchievementAndBadgesForTreatment] Found achievement ${achievementId} for treatment ${treatmentId}`);

                // 1. Primero eliminar los badges asociados al achievement
                await this.badgeRepository.deleteByAchievementId(achievementId);
                console.log(`[deleteAchievementAndBadgesForTreatment] Deleted badges for achievement ${achievementId}`);

                // 2. Luego eliminar el achievement
                await this.achievementRepository.delete(achievementId);
                console.log(`[deleteAchievementAndBadgesForTreatment] Deleted achievement ${achievementId}`);
            } else {
                console.log(`[deleteAchievementAndBadgesForTreatment] No achievement found for treatment ${treatmentId}`);
            }
        } catch (error) {
            console.error(`[deleteAchievementAndBadgesForTreatment] Error deleting achievement and badges:`, error);
        }
    }

    /**
     *  Elimina todas las consultas activas de un paciente
     */
    private async deleteConsultationsForPatient(patientId: string): Promise<void> {
        try {
            const consultation = await this.consultationRepository.findOpenByPatientId(patientId);

            if (consultation) {
                const consultationId = consultation.getId();
                console.log(`[deleteConsultationsForPatient] Found active consultation ${consultationId} for patient ${patientId}`);

                // Eliminar la consulta
                await this.consultationRepository.delete(consultationId);
                console.log(`[deleteConsultationsForPatient] Deleted consultation ${consultationId}`);
            } else {
                console.log(`[deleteConsultationsForPatient] No active consultation found for patient ${patientId}`);
            }
        } catch (error) {
            console.error(`[deleteConsultationsForPatient] Error deleting consultation:`, error);
            // No lanzamos el error para no interrumpir el alta
        }
    }
    /**
     * ✅ Elimina el Medical Record de un paciente
     */
    private async deleteMedicalRecordForPatient(patientId: string): Promise<void> {
        try {
            const medicalRecord = await this.medicalRecordRepository.findByPatientId(patientId);

            if (medicalRecord) {
                const medicalRecordId = medicalRecord.toPrimitives().id;
                console.log(`[deleteMedicalRecordForPatient] Found medical record ${medicalRecordId} for patient ${patientId}`);

                await this.medicalRecordRepository.delete(medicalRecordId);
                console.log(`[deleteMedicalRecordForPatient] Deleted medical record ${medicalRecordId}`);
            } else {
                console.log(`[deleteMedicalRecordForPatient] No medical record found for patient ${patientId}`);
            }
        } catch (error) {
            console.error(`[deleteMedicalRecordForPatient] Error deleting medical record:`, error);
            // No lanzamos el error para no interrumpir el alta
        }
        }
}