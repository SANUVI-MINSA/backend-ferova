import {PatientCommandService} from "../../domain/services/PatientCommandService";
import {PatientQueryService} from "../../domain/services/PatientQueryService";
import {UpdateMedicalRecordCommand} from "../../domain/model/commands/UpdateMedicalRecordCommand";
import {DischargePatientCommand} from "../../domain/model/commands/DischargePatientCommand";
import {RegisterHemoglobinControlCommand} from "../../domain/model/commands/RegisterHemoglobinControlCommand";
import {CreateInitialMedicalRecordCommand} from "../../domain/model/commands/CreateInitialMedicalRecordCommand";
import {AssignPatientToNurseCommand} from "../../domain/model/commands/AssignPatientToNurseCommand";
import {RegisterPatientCommand} from "../../domain/model/commands/RegisterPatientCommand";
import {GetPatientsEligibleForDischargeQuery} from "../../domain/model/queries/GetPatientsEligibleForDischargeQuery";
import {DownloadHemoglobinReportPdfQuery} from "../../domain/model/queries/DownloadHemoglobinReportPdfQuery";
import {DownloadMedicalRecordPdfQuery} from "../../domain/model/queries/DownloadMedicalRecordPdfQuery";
import {GetHemoglobinControlsHistoryQuery} from "../../domain/model/queries/GetHemoglobinControlsHistoryQuery";
import {GetMedicalRecordQuery} from "../../domain/model/queries/GetMedicalRecordQuery";
import {ListPatientsByMotherQuery} from "../../domain/model/queries/ListPatientsByMotherQuery";
import {SearchMotherByDniQuery} from "../../domain/model/queries/SearchMotherByDniQuery";
import {GetPatientsAssignedToNurseQuery} from "../../domain/model/queries/GetPatientsAssignedToNurseQuery";
import {GetHemoglobinEvolutionChartQuery} from "../../domain/model/queries/getHemoglobinEvolutionChart";
import {GetMotherPatientsSummaryQuery} from "../../domain/model/queries/GetMotherPatientsSummaryQuery";
import {GetActivePatientsCountQuery} from "../../domain/model/queries/GetActivePatientsCountQuery";
import {GetPatientBasicInfoQuery} from "../../domain/model/queries/GetPatientBasicInfoQuery";

export class PatientManagementFacade {

    constructor(
        private commandService:
        PatientCommandService,

        private queryService:
        PatientQueryService
    ) {}

    async registerPatient(
        command: RegisterPatientCommand
    ): Promise<void> {
        return await this
            .commandService
            .registerPatient(
                command
            );
    }

    async assignPatientToNurse(
        command:
        AssignPatientToNurseCommand
    ): Promise<void> {
        return await this
            .commandService
            .assignPatientToNurse(
                command
            );
    }

    async createInitialMedicalRecord(
        command:
        CreateInitialMedicalRecordCommand
    ): Promise<void> {
        return await this
            .commandService
            .createInitialMedicalRecord(
                command
            );
    }

    async registerHemoglobinControl(
        command:
        RegisterHemoglobinControlCommand
    ): Promise<void> {
        return await this
            .commandService
            .registerHemoglobinControl(
                command
            );
    }

    async dischargePatient(
        command:
        DischargePatientCommand
    ): Promise<void> {
        return await this
            .commandService
            .dischargePatient(
                command
            );
    }

    async updateMedicalRecord(
        command:
        UpdateMedicalRecordCommand
    ): Promise<void> {
        return await this
            .commandService
            .updateMedicalRecord(
                command
            );
    }

    async searchMotherByDni(
        query:
        SearchMotherByDniQuery
    ): Promise<any> {
        return await this
            .queryService
            .searchMotherByDni(
                query
            );
    }

    async listPatientsByMother(
        query:
        ListPatientsByMotherQuery
    ): Promise<any[]> {
        return await this
            .queryService
            .listPatientsByMother(
                query
            );
    }

    async getMedicalRecord(
        query:
        GetMedicalRecordQuery
    ): Promise<any> {
        return await this
            .queryService
            .getMedicalRecord(
                query
            );
    }

    async getHemoglobinControlsHistory(
        query: GetHemoglobinControlsHistoryQuery
    ): Promise<any> {
        return await this.queryService.getHemoglobinControlsHistory(query);
    }

    async downloadMedicalRecordPdf(
        query:
        DownloadMedicalRecordPdfQuery
    ): Promise<Buffer> {
        return await this
            .queryService
            .downloadMedicalRecordPdf(
                query
            );
    }

    async downloadHemoglobinReportPdf(
        query:
        DownloadHemoglobinReportPdfQuery
    ): Promise<Buffer> {
        return await this
            .queryService
            .downloadHemoglobinReportPdf(
                query
            );
    }

    async getPatientsEligibleForDischarge(
        query:
        GetPatientsEligibleForDischargeQuery
    ): Promise<any[]> {
        return await this
            .queryService
            .getPatientsEligibleForDischarge(
                query
            );
    }

    async getPatientsAssignedToNurse(
        query:
        GetPatientsAssignedToNurseQuery
    ): Promise<any[]> {

        return await this
            .queryService
            .getPatientsAssignedToNurse(
                query
            );
    }

    async getHemoglobinEvolutionChart(
        query:
        GetHemoglobinEvolutionChartQuery
    ): Promise<any> {

        return await this
            .queryService
            .getHemoglobinEvolutionChart(
                query
            );
    }

    async validatePatientBelongsToMother(patientId: string, motherId: string): Promise<void> {
        // Obtener el paciente
        const patient = await this.queryService.getPatient({ patientId });

        if (!patient) {
            throw new Error("Patient not found");
        }

        // Verificar que el motherId coincida
        if (patient.motherId !== motherId) {
            throw new Error("Access denied: This patient does not belong to you");
        }
    }

    // ✅ NUEVO MÉTODO: Obtener un paciente por ID (para validaciones)
    async getPatient(patientId: string): Promise<any> {
        return await this.queryService.getPatient({ patientId });
    }

    // PatientManagementFacade.ts - Añadir este método

    async validateNurseHasPatient(nurseId: string, patientId: string): Promise<void> {
        const patient = await this.queryService.getPatient({ patientId });

        if (!patient) {
            throw new Error("Patient not found");
        }

        if (patient.nurseId !== nurseId) {
            throw new Error("Access denied: This patient is not assigned to you");
        }
    }

    async validateNurseHasAccessToMedicalRecord(nurseId: string, medicalRecordId: string): Promise<void> {
        // Obtener el medical record
        const medicalRecord = await this.queryService.getMedicalRecordById({ medicalRecordId });

        if (!medicalRecord) {
            throw new Error("Medical record not found");
        }

        // Verificar que el paciente asociado esté asignado a esta enfermera
        const patient = await this.queryService.getPatient({ patientId: medicalRecord.patientId });

        if (!patient) {
            throw new Error("Patient not found");
        }

        if (patient.nurseId !== nurseId) {
            throw new Error("Access denied: This medical record does not belong to a patient assigned to you");
        }
    }

    async getActivePatientsCount(query: GetActivePatientsCountQuery): Promise<number> {
        return await this.queryService.GetActivePatientsCountQuery(query);
    }

    async getMotherPatientsSummary(query: GetMotherPatientsSummaryQuery): Promise<Array<any>> {
        return await this.queryService.getMotherPatientsSummary(query);
    }

    async getPatientBasicInfo(
        query: GetPatientBasicInfoQuery
    ): Promise<{ id: string; name: string; lastName: string } | null> {
        return await this.queryService.getPatientBasicInfo(query);
    }

}
