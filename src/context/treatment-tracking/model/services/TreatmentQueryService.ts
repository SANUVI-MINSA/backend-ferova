import {GetTodayDoseQuery} from "../domain/queries/GetTodayDoseQuery";
import {GetPatientDoseHistoryQuery} from "../domain/queries/GetPatientDoseHistoryQuery";
import {GetPendingPatientsByNurseQuery} from "../domain/queries/GetPendingPatientsByNurseQuery";
import {GetRiskLevelOverviewQuery} from "../domain/queries/GetRiskLevelOverviewQuery";
import {GetTreatmentsByNurseQuery} from "../domain/queries/GetTreatmentsByNurseQuery";
import {GetCriticalAlertsByNurseQuery} from "../domain/queries/GetCriticalAlertsByNurseQuery";
import {GetPatientTreatmentDetailQuery} from "../domain/queries/GetPatientTreatmentDetailQuery";
import {GetTreatmentDetailsQuery} from "../domain/queries/GetTreatmentDetailsQuery";
import {GetPatientsByRiskLevelQuery} from "../domain/queries/GetPatientsByRiskLevelQuery";

export interface TreatmentQueryService {
    getTodayDose(
        query: GetTodayDoseQuery
    ): Promise<any>;

    getPatientDoseHistory(
        query: GetPatientDoseHistoryQuery
    ): Promise<any>;

    getPendingPatientsByNurse(
        query: GetPendingPatientsByNurseQuery
    ): Promise<any>;

    getRiskLevelOverview(
        query: GetRiskLevelOverviewQuery
    ): Promise<any>;

    getTreatmentsByNurse(
        query: GetTreatmentsByNurseQuery
    ): Promise<any>;

    getTreatmentDetails(
        query: GetTreatmentDetailsQuery
    ): Promise<any>;

    getPatientsByRiskLevel(
        query: GetPatientsByRiskLevelQuery
    ): Promise<any>;

    getPatientTreatmentDetail(
        query: GetPatientTreatmentDetailQuery
    ): Promise<any>;

    getCriticalAlertsByNurse(
        query: GetCriticalAlertsByNurseQuery
    ): Promise<any>;

}