import {PatientQueryService} from "../../domain/services/PatientQueryService";
import {PatientRepository} from "../../domain/repositories/PatientRepository";
import {MedicalRecordRepository} from "../../domain/repositories/MedicalRecordRepository";
import {GetHemoglobinControlsHistoryQuery} from "../../domain/model/queries/GetHemoglobinControlsHistoryQuery";
import {GetMedicalRecordQuery} from "../../domain/model/queries/GetMedicalRecordQuery";
import {GetPatientsEligibleForDischargeQuery} from "../../domain/model/queries/GetPatientsEligibleForDischargeQuery";
import {ListPatientsByMotherQuery} from "../../domain/model/queries/ListPatientsByMotherQuery";
import {SearchMotherByDniQuery} from "../../domain/model/queries/SearchMotherByDniQuery";
import {UserRepository} from "../../../iam/domain/repositories/UserRepository";

export class PatientQueryServiceImpl
    implements PatientQueryService {

    constructor(
        private patientRepository:
        PatientRepository,

        private medicalRecordRepository:
        MedicalRecordRepository,

        // Inyectar UserRepository si es necesario para obtener información adicional sobre los usuarios madres
        private userRepository: UserRepository
    ) {}

    async downloadHemoglobinReportPdf(): Promise<Buffer> {
        return Buffer.from(
            "Hemoglobin Report PDF"
        );
    }

    async downloadMedicalRecordPdf(): Promise<Buffer> {
        return Buffer.from(
            "Medical Record PDF"
        );
    }


    async getHemoglobinControlsHistory(
        query:
        GetHemoglobinControlsHistoryQuery
    ): Promise<any> {

        const medicalRecord =
            await this
                .medicalRecordRepository
                .findById(
                    query.medicalRecordId
                );

        if (!medicalRecord) {
            throw new Error(
                "Medical record not found"
            );
        }

        const controls =
            medicalRecord
                .toPrimitives()
                .controls;

        const levels =
            controls.map(
                (c: any) =>
                    c.hemoglobinLevel
            );

        const average =
            levels.reduce(
                (a: number, b: number) => a + b,
                0
            ) / levels.length;

        return {
            controls,
            averageHemoglobin:
            average,
            totalControls:
            controls.length
        };
    }

    async getMedicalRecord(
        query: GetMedicalRecordQuery
    ): Promise<any> {

        const patient =
            await this
                .patientRepository
                .findById(
                    query.patientId
                );

        const medicalRecord =
            await this
                .medicalRecordRepository
                .findByPatientId(
                    query.patientId
                );

        if (!patient || !medicalRecord) {
            throw new Error(
                "Medical record not found"
            );
        }

        return {
            patient:
                patient.toPrimitives(),

            medicalRecord:
                medicalRecord
                    .toPrimitives()
        };
    }

    async getPatientsEligibleForDischarge(
        query:
        GetPatientsEligibleForDischargeQuery
    ): Promise<any[]> {

        const patients =
            await this
                .patientRepository
                .findPatientsEligibleForDischarge(
                    query.nurseId
                );

        return patients.map(
            patient =>
                patient
                    .toPrimitives()
        );
    }

    async listPatientsByMother(
        query: ListPatientsByMotherQuery
    ): Promise<any[]> {

        const patients =
            await this
                .patientRepository
                .findByMotherId(
                    query.motherId
                );

        return patients.map(
            patient => {

                const data =
                    patient.toPrimitives();

                return {
                    patientId:
                    data.id,

                    patientName:
                    data.name,

                    patientLastName:
                    data.lastName,

                    gender:
                    data.gender,

                    status:
                    data.status,

                    statusAssignment:
                        data.nurseId
                            ? "ASSIGNED"
                            : "UNASSIGNED"
                };
            }
        );
    }

    async searchMotherByDni(
        query: SearchMotherByDniQuery
    ): Promise<any> {

        const mother =
            await this.userRepository
                .findMotherByDni(
                    query.dni
                );

        if (!mother) {
            throw new Error(
                "Mother not found"
            );
        }

        const data =
            mother.toPrimitives();

        return {
            motherId: data.id,
            fullName:
                `${data.name} ${data.lastname}`,
            dni: data.dni
        };
    }
}