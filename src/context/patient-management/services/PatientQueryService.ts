import {SearchMotherByDniQuery} from "../domain/queries/SearchMotherByDniQuery";
import {ListPatientsByMotherQuery} from "../domain/queries/ListPatientsByMotherQuery";
import {GetMedicalRecordQuery} from "../domain/queries/GetMedicalRecordQuery";
import {GetHemoglobinControlsHistoryQuery} from "../domain/queries/GetHemoglobinControlsHistoryQuery";
import {DownloadMedicalRecordPdfQuery} from "../domain/queries/DownloadMedicalRecordPdfQuery";
import {DownloadHemoglobinReportPdfQuery} from "../domain/queries/DownloadHemoglobinReportPdfQuery";
import {GetPatientsEligibleForDischargeQuery} from "../domain/queries/GetPatientsEligibleForDischargeQuery";

export interface PatientQueryService {

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
}