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
import { GetActivePatientsCountQuery } from "../../domain/model/queries/GetActivePatientsCountQuery";
import { GetMotherPatientsSummaryQuery } from "../../domain/model/queries/GetMotherPatientsSummaryQuery";
import { GetPatientBasicInfoQuery } from "../../domain/model/queries/GetPatientBasicInfoQuery";

export class PatientQueryServiceImpl
    implements PatientQueryService {

    constructor(
        private patientRepository:
        PatientRepository,
        private medicalRecordRepository:
        MedicalRecordRepository,
        // Inyectar UserRepository si es necesario para obtener información adicional sobre los usuarios madres
        private userRepository: UserRepository
    ) {
    }

    // MÉTODO PRIVADO: Filtro para pacientes elegibles (nombre y apellido)

    private filterPatientsBySearchTerm<T extends { name: string; lastName: string }>(
        items: T[],
        searchTerm?: string
    ): T[] {
        if (!searchTerm) return items;

        const terms = searchTerm.trim().toLowerCase().split(/\s+/);

        return items.filter(item => {
            const fullName = `${item.name} ${item.lastName}`.toLowerCase();
            const nameLower = item.name.toLowerCase();
            const lastNameLower = item.lastName.toLowerCase();

            if (terms.length === 1) {
                const term = terms[0];
                return (
                    nameLower.includes(term) ||
                    lastNameLower.includes(term) ||
                    fullName.includes(term)
                );
            }

            return terms.every(term =>
                nameLower.includes(term) ||
                lastNameLower.includes(term) ||
                fullName.includes(term)
            );
        });
    }

    // MÉTODO PRIVADO: Filtro para madres (SOLO DNI)
    private filterMothersByDNI(
        mothers: any[],
        searchTerm?: string
    ): any[] {
        if (!searchTerm) return mothers;

        const term = searchTerm.trim();

        return mothers.filter(mother => {
            const dni = mother.dni || '';
            return dni.includes(term);
        });
    }

    // MÉTODO PRIVADO: Filtro para pacientes asignados (SOLO nombre y apellido)
    private filterAssignedPatientsByName(
        items: any[],
        searchTerm?: string
    ): any[] {
        if (!searchTerm) return items;

        const terms = searchTerm.trim().toLowerCase().split(/\s+/);

        return items.filter(item => {
            const fullName = item.fullName.toLowerCase();

            if (terms.length === 1) {
                const term = terms[0];
                return fullName.includes(term);
            }

            return terms.every(term => fullName.includes(term));
        });
    }

    async getPatientBasicInfo(
        query: GetPatientBasicInfoQuery
    ): Promise<{ id: string; name: string; lastName: string } | null> {

        const patient = await this.patientRepository.findById(query.patientId);

        if (!patient) {
            return null;
        }

        const data = patient.toPrimitives();

        return {
            id: data.id,
            name: data.name,
            lastName: data.lastName
        };
    }


    async getMotherPatientsSummary(query: GetMotherPatientsSummaryQuery): Promise<Array<any>> {
        const patients = await this.patientRepository.findByMotherId(query.motherId);

        return patients.map(patient => {
            const data = patient.toPrimitives();
            return {
                id: data.id,
                name: data.name
            };
        });
    }

    async GetActivePatientsCountQuery(query: GetActivePatientsCountQuery): Promise<any> {
        const patients = await this.patientRepository.findByNurseId(query.nurseId);

        const activePatients = patients.filter(
            patient => patient.toPrimitives().status !== "DISCHARGED"
        );

        return activePatients.length;
    }

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

        const medicalRecordData = medicalRecord.toPrimitives();
        const controls = medicalRecord.toPrimitives().controls;

        const patient = await this.patientRepository.findById(medicalRecordData.patientId);

        if (!patient) {
            throw new Error("Patient not found")
        }

        const patientData = patient.toPrimitives();

        if (!controls.length) {
            return {
                patient: patientData.id,
                patientName: patientData.name,
                controls: [],
                averageHemoglobin: 0,
                totalControls: 0,
                evolution: null, // Sin evolución si no hay controles
                trend: null      // Tendencia: 'UP', 'DOWN', 'STABLE'
            };
        }

        const levels = controls.map((c: any) => c.hemoglobinLevel);
        const average = levels.reduce((a: number, b: number) => a + b, 0) / levels.length;

        // Calcular evolución (primer control - último control)
        const firstControl = levels[0];
        const lastControl = levels[levels.length - 1];
        const evolution = lastControl - firstControl; // Positivo = subió, Negativo = bajó

        // Determinar tendencia
        let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (evolution > 0) trend = 'UP';
        if (evolution < 0) trend = 'DOWN';

        return {
            patientId: patientData.id,
            patientName: patientData.name + " " + patientData.lastName,
            controls,
            averageHemoglobin: average,
            totalControls: controls.length,
            evolution: evolution,           // Valor numérico (ej: +0.5, -0.3)
            trend: trend,                   // Tendencia para el frontend
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
        query: GetPatientsEligibleForDischargeQuery
    ): Promise<{ patients: any[]; total: number; searchTerm?: string }> {
        const patients = await this.patientRepository.findPatientsEligibleForDischarge(query.nurseId);

        let patientData = patients.map(patient => patient.toPrimitives());

        // Filtrar por searchTerm si existe (nombre y apellido)
        if (query.searchTerm) {
            patientData = this.filterPatientsBySearchTerm(patientData, query.searchTerm);
        }

        return {
            patients: patientData,
            total: patientData.length,
            searchTerm: query.searchTerm || undefined
        };
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

        const { searchTerm } = query;

        if (!searchTerm) {
            throw new Error("Search term is required");
        }

        // Buscar madres en el repositorio
        const mothers =
            await this.userRepository
                .findMothersBySearchTerm(
                    searchTerm
                );

        if (!mothers || mothers.length === 0) {
            throw new Error("No mothers found matching the search criteria");
        }

        // Convertir a primitivos
        let motherData = mothers.map(
            mother => mother.toPrimitives()
        );

        // Filtrar SOLO por DNI (coincidencia parcial)
        motherData = this.filterMothersByDNI(motherData, searchTerm);

        if (motherData.length === 0) {
            throw new Error("No mothers found with matching DNI");
        }

        return motherData.map(mother => ({
            motherId: mother.id,
            fullName: `${mother.name} ${mother.lastname || ''}`.trim(),
            dni: mother.dni
        }));
    }

    async getPatientsAssignedToNurse(
        query: GetPatientsAssignedToNurseQuery
    ): Promise<{ patients: any[]; total: number; searchTerm?: string }> {
        const patients = await this.patientRepository.findByNurseId(query.nurseId);

        const activePatients = patients.filter(
            patient => patient.toPrimitives().status !== "DISCHARGED"
        );

        let patientData = activePatients.map(patient => {
            const data = patient.toPrimitives();
            return {
                patientId: data.id,
                fullName: `${data.name} ${data.lastName}`,
                gender: data.gender,
                status: data.status,
                facilityId: data.facilityId
            };
        });

        // Filtrar SOLO por nombre y apellido (NO por ID)
        if (query.searchTerm) {
            patientData = this.filterAssignedPatientsByName(patientData, query.searchTerm);
        }

        return {
            patients: patientData,
            total: patientData.length,
            searchTerm: query.searchTerm || undefined
        };
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

    async getMedicalRecordById(query: { medicalRecordId: string }): Promise<any> {
        const medicalRecord = await this.medicalRecordRepository.findById(query.medicalRecordId);

        if (!medicalRecord) {
            return null;
        }

        return medicalRecord.toPrimitives();
    }

    async checkPatientMedicalRecord(
        query: { patientId: string }
    ): Promise<{ patientId: string; hasMedicalRecord: boolean; medicalRecordId?: string }> {
        const medicalRecord = await this.medicalRecordRepository
            .findByPatientId(query.patientId);

        const patient = await this.patientRepository.findById(query.patientId);

        if (!patient) {
            throw new Error("Patient not found")
        }

        const patientData = patient.toPrimitives();

        if (!medicalRecord) {
            return {
                patientId: patientData.id,
                hasMedicalRecord: false
            };
        }

        return {
            patientId: patientData.id,
            hasMedicalRecord: true,
            medicalRecordId: medicalRecord.toPrimitives().id
        };
    }
}