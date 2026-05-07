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

export class PatientCommandServiceImpl
    implements PatientCommandService {

    constructor(
        private patientRepository:
        PatientRepository,
        private medicalRecordRepository:
        MedicalRecordRepository,
        // Inject NurseAssignmentRepository if needed for assigning nurses to patients or other operations related to nurse assignments
        private nurseAssignmentRepository: NurseAssignmentRepository

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

        patient.discharge(
            command.nurseId
        );

        await this
            .patientRepository
            .update(patient);
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

    async updateMedicalRecord(
        command:
        UpdateMedicalRecordCommand
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

        medicalRecord
            .updateClinicalInformation(
                new Weight(
                    command.weight
                ),
                new Height(
                    command.height
                ),
                new MotivoConsulta(
                    command.motivoConsulta
                ),
                new Observaciones(
                    command.observaciones
                ),
                command.antecedentes || [],

                command.sintomas || []
            );

        await this
            .medicalRecordRepository
            .update(
                medicalRecord
            );
    }
}