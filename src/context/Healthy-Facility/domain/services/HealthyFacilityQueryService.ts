import {GetHealthFacilityDetailQuery} from "../model/queries/GetHealthFacilityDetailQuery";
import {HealthFacility} from "../model/aggregate/HealthFacility";
import {Appointment} from "../model/entities/Appointment";
import {GetPatientAppointmentHistoryQuery} from "../model/queries/GetPatientAppointmentHistoryQuery";

export interface HealthyFacilityQueryService {
    getHealthFacilityDetail(
        query: GetHealthFacilityDetailQuery
    ): Promise<HealthFacility | null>;

    getHealthFacilityDetail(
        query: GetHealthFacilityDetailQuery
    ): Promise<HealthFacility | null>;

    getPatientAppointmentHistory(
        query: GetPatientAppointmentHistoryQuery
    ): Promise<Appointment[]>
}