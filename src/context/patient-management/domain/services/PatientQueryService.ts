import {SearchMotherByDniQuery} from "../model/queries/SearchMotherByDniQuery";
import {ListPatientsByMotherQuery} from "../model/queries/ListPatientsByMotherQuery";
import {GetMedicalRecordQuery} from "../model/queries/GetMedicalRecordQuery";
import {GetHemoglobinControlsHistoryQuery} from "../model/queries/GetHemoglobinControlsHistoryQuery";
import {DownloadMedicalRecordPdfQuery} from "../model/queries/DownloadMedicalRecordPdfQuery";
import {DownloadHemoglobinReportPdfQuery} from "../model/queries/DownloadHemoglobinReportPdfQuery";
import {GetPatientsEligibleForDischargeQuery} from "../model/queries/GetPatientsEligibleForDischargeQuery";
import {GetPatientsAssignedToNurseQuery} from "../model/queries/GetPatientsAssignedToNurseQuery";
import {GetHemoglobinEvolutionChartQuery} from "../model/queries/getHemoglobinEvolutionChart";
import {GetPatientQuery} from "../model/queries/GetPatientQuery";
import {GetActivePatientsCountQuery} from "../model/queries/GetActivePatientsCountQuery";
import {GetMotherPatientsSummaryQuery} from "../model/queries/GetMotherPatientsSummaryQuery";

export interface PatientQueryService {

    getPatient(query: { patientId: string }): Promise<any>;


    searchMotherByDni(
        query:
        SearchMotherByDniQuery
    ): Promise<any>;

    listPatientsByMother(
        query:
        ListPatientsByMotherQuery
    ): Promise<any[]>;

    getMedicalRecord(
        query:
        GetMedicalRecordQuery
    ): Promise<any>;

    getHemoglobinControlsHistory(
        query:
        GetHemoglobinControlsHistoryQuery
    ): Promise<any>;

    downloadMedicalRecordPdf(
        query:
        DownloadMedicalRecordPdfQuery
    ): Promise<Buffer>;

    downloadHemoglobinReportPdf(
        query:
        DownloadHemoglobinReportPdfQuery
    ): Promise<Buffer>;

    getPatientsEligibleForDischarge(
        query:
        GetPatientsEligibleForDischargeQuery
    ): Promise<any[]>;

    getPatientsAssignedToNurse(
        query: GetPatientsAssignedToNurseQuery
    ): Promise<any[]>;

    getHemoglobinEvolutionChart(
        query: GetHemoglobinEvolutionChartQuery
    ): Promise<any>;

    getMedicalRecordById(query: { medicalRecordId: string }): Promise<any>;

    GetActivePatientsCountQuery(
        query: GetActivePatientsCountQuery
    ): Promise<number>;

    // Agregar esta firma
    getMotherPatientsSummary(query: GetMotherPatientsSummaryQuery): Promise<Array<any>>;
}