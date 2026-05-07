import {SearchMotherByDniQuery} from "../model/queries/SearchMotherByDniQuery";
import {ListPatientsByMotherQuery} from "../model/queries/ListPatientsByMotherQuery";
import {GetMedicalRecordQuery} from "../model/queries/GetMedicalRecordQuery";
import {GetHemoglobinControlsHistoryQuery} from "../model/queries/GetHemoglobinControlsHistoryQuery";
import {DownloadMedicalRecordPdfQuery} from "../model/queries/DownloadMedicalRecordPdfQuery";
import {DownloadHemoglobinReportPdfQuery} from "../model/queries/DownloadHemoglobinReportPdfQuery";
import {GetPatientsEligibleForDischargeQuery} from "../model/queries/GetPatientsEligibleForDischargeQuery";

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