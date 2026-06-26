import {SearchMotherByDniQuery} from "../model/queries/SearchMotherByDniQuery";
import {ListPatientsByMotherQuery} from "../model/queries/ListPatientsByMotherQuery";
import {GetMedicalRecordQuery} from "../model/queries/GetMedicalRecordQuery";
import {GetHemoglobinControlsHistoryQuery} from "../model/queries/GetHemoglobinControlsHistoryQuery";
import {DownloadMedicalRecordPdfQuery} from "../model/queries/DownloadMedicalRecordPdfQuery";
import {DownloadHemoglobinReportPdfQuery} from "../model/queries/DownloadHemoglobinReportPdfQuery";
import {GetPatientsEligibleForDischargeQuery} from "../model/queries/GetPatientsEligibleForDischargeQuery";
import {GetPatientsAssignedToNurseQuery} from "../model/queries/GetPatientsAssignedToNurseQuery";
import {GetHemoglobinEvolutionChartQuery} from "../model/queries/getHemoglobinEvolutionChart";
import {GetActivePatientsCountQuery} from "../model/queries/GetActivePatientsCountQuery";
import {GetMotherPatientsSummaryQuery} from "../model/queries/GetMotherPatientsSummaryQuery";
import {GetPatientBasicInfoQuery} from "../model/queries/GetPatientBasicInfoQuery";
import {CheckPatientMedicalRecordQuery} from "../model/queries/checkPatientMedicalRecord";

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

    getPatientBasicInfo(
        query: GetPatientBasicInfoQuery
    ): Promise<{ id: string; name: string; lastName: string } | null>;

    checkPatientMedicalRecord(
        query: CheckPatientMedicalRecordQuery
    ): Promise<{ patientId: string; hasMedicalRecord: boolean; medicalRecordId?: string}>;
}