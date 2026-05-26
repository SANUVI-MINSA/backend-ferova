import {GetHealthFacilityDetailQuery} from "../model/queries/GetHealthFacilityDetailQuery";
import {HealthFacility} from "../model/aggregate/HealthFacility";
import {Appointment} from "../model/entities/Appointment";
import {ListHealthFacilitiesQuery} from "../model/queries/ListHealthFacilitiesQuery";
import {GetPatientAppointmentHistoryQuery} from "../model/queries/GetPatientAppointmentHistoryQuery";
import {GetNurseAppointmentScheduleQuery} from "../model/queries/GetNurseAppointmentScheduleQuery";
import {GetFacilityAvailableSlotsQuery} from "../model/queries/GetFacilityAvailableSlotsQuery";
import {GetMotherNextAppointmentQuery} from "../model/queries/GetMotherNextAppointmentQuery";
import {ListUnassignedNursesQuery} from "../model/queries/ListUnassignedNursesQuery";

export interface HealthFacilityQueryService {

    listHealthFacilities(
        query: ListHealthFacilitiesQuery
    ): Promise<any>;

    getHealthFacilityDetail(
        query: GetHealthFacilityDetailQuery
    ): Promise<HealthFacility | null>;

    getPatientAppointmentHistory(
        query: GetPatientAppointmentHistoryQuery
    ): Promise<Appointment[]>;

    getNurseAppointmentSchedule(
        query: GetNurseAppointmentScheduleQuery
    ): Promise<Appointment[]>;

    getFacilityAvailableSlots(
        query: GetFacilityAvailableSlotsQuery
    ): Promise<any[]>;

    getMotherNextAppointment(
        query: GetMotherNextAppointmentQuery
    ): Promise<any>;

    listUnassignedNurses(
        query: ListUnassignedNursesQuery
    ): Promise<{ id: string; fullName: string }[]>;
}