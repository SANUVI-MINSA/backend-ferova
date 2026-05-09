import {PatientQueryService} from "../../domain/services/PatientQueryService";
import {PatientRepository} from "../../domain/repositories/PatientRepository";
import {MedicalRecordRepository} from "../../domain/repositories/MedicalRecordRepository";
import {GetHemoglobinControlsHistoryQuery} from "../../domain/model/queries/GetHemoglobinControlsHistoryQuery";
import {GetMedicalRecordQuery} from "../../domain/model/queries/GetMedicalRecordQuery";
import {GetPatientsEligibleForDischargeQuery} from "../../domain/model/queries/GetPatientsEligibleForDischargeQuery";
import {ListPatientsByMotherQuery} from "../../domain/model/queries/ListPatientsByMotherQuery";
import {SearchMotherByDniQuery} from "../../domain/model/queries/SearchMotherByDniQuery";
import {UserRepository} from "../../../iam/domain/repositories/UserRepository";
import {Error, Promise} from "mongoose";
import {GetPatientsAssignedToNurseQuery} from "../../domain/model/queries/GetPatientsAssignedToNurseQuery";
import {PdfService} from "../../infrastructure/services/PdfService";
import {DownloadMedicalRecordPdfQuery} from "../../domain/model/queries/DownloadMedicalRecordPdfQuery";
import {DownloadHemoglobinReportPdfQuery} from "../../domain/model/queries/DownloadHemoglobinReportPdfQuery";
import {GetHemoglobinEvolutionChartQuery} from "../../domain/model/queries/getHemoglobinEvolutionChart";
import {GetPatientQuery} from "../../domain/model/queries/GetPatientQuery";

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

    async downloadHemoglobinReportPdf(
        query: DownloadHemoglobinReportPdfQuery
    ): Promise<Buffer> {

        const medicalRecord =
            await this.medicalRecordRepository
                .findById(
                    query.medicalRecordId
                );

        if (!medicalRecord) {
            throw new Error(
                "Medical record not found"
            );
        }

        return await PdfService
            .generateHemoglobinReportPdf(
                medicalRecord.toPrimitives()
            );
    }

    async downloadMedicalRecordPdf(
        query: DownloadMedicalRecordPdfQuery
    ): Promise<Buffer> {

        const medicalRecord =
            await this.medicalRecordRepository
                .findById(
                    query.medicalRecordId
                );

        if (!medicalRecord) {
            throw new Error(
                "Medical record not found"
            );
        }

        const medicalData =
            medicalRecord.toPrimitives();

        const patient =
            await this.patientRepository
                .findById(
                    medicalData.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        return await PdfService
            .generateMedicalRecordPdf(
                patient.toPrimitives(),
                medicalData
            );
    }


    async getHemoglobinControlsHistory(
        query: GetHemoglobinControlsHistoryQuery
    ): Promise<any> {
        const medicalRecord = await this.medicalRecordRepository.findById(query.medicalRecordId);

        if (!medicalRecord) {
            throw new Error("Medical record not found");
        }

        const controls = medicalRecord.toPrimitives().controls;

        if (!controls.length) {
            return {
                controls: [],
                averageHemoglobin: 0,
                totalControls: 0,
                evolution: null, // ✅ Sin evolución si no hay controles
                trend: null      // ✅ Tendencia: 'UP', 'DOWN', 'STABLE'
            };
        }

        const levels = controls.map((c: any) => c.hemoglobinLevel);
        const average = levels.reduce((a: number, b: number) => a + b, 0) / levels.length;

        // ✅ Calcular evolución (primer control - último control)
        const firstControl = levels[0];
        const lastControl = levels[levels.length - 1];
        const evolution = lastControl - firstControl; // Positivo = subió, Negativo = bajó

        // ✅ Determinar tendencia
        let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (evolution > 0) trend = 'UP';
        if (evolution < 0) trend = 'DOWN';

        return {
            controls,
            averageHemoglobin: average,
            totalControls: controls.length,
            evolution: evolution,           // ✅ Valor numérico (ej: +0.5, -0.3)
            trend: trend,                   // ✅ Tendencia para el frontend
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

    async getPatientsAssignedToNurse(
        query: GetPatientsAssignedToNurseQuery
    ): Promise<any[]> {

        const patients =
            await this
                .patientRepository
                .findByNurseId(
                    query.nurseId
                );

        const activePatients =
            patients.filter(
                patient =>
                    patient
                        .toPrimitives()
                        .status !== "DISCHARGED"
            );

        return activePatients.map(
            patient => {

                const data =
                    patient.toPrimitives();

                return {
                    patientId:
                    data.id,

                    fullName:
                        `${data.name} ${data.lastName}`,

                    gender:
                    data.gender,

                    status:
                    data.status,

                    facilityId:
                    data.facilityId
                };
            }
        );
    }

    async getHemoglobinEvolutionChart(
        query: GetHemoglobinEvolutionChartQuery
    ): Promise<any> {

        const medicalRecord =
            await this
                .medicalRecordRepository
                .findByPatientId(
                    query.patientId
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

        const sortedControls =
            controls.sort(
                (a: any, b: any) =>
                    new Date(a.date).getTime() -
                    new Date(b.date).getTime()
            );

        const chartData =
            sortedControls.map(
                (control: any) => ({
                    date: control.date,
                    hemoglobinLevel:
                    control.hemoglobinLevel
                })
            );

        const latestValue =
            sortedControls.length > 0
                ? sortedControls[
                sortedControls.length - 1
                    ].hemoglobinLevel
                : null;

        return {
            currentHemoglobin:
            latestValue,

            chart:
            chartData
        };
    }

    async getPatient(query: GetPatientQuery): Promise<any> {
        const patient = await this.patientRepository.findById(query.patientId);

        if (!patient) {
            return null;
        }

        return patient.toPrimitives();
    }
}