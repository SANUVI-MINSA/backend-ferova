import {GetHealthFacilityDetailQuery} from "../model/queries/GetHealthFacilityDetailQuery";
import {HealthFacility} from "../model/aggregate/HealthFacility";
import {Appointment} from "../model/entities/Appointment";
import {ListHealthFacilitiesQuery} from "../model/queries/ListHealthFacilitiesQuery";
import {GetPatientAppointmentHistoryQuery} from "../model/queries/GetPatientAppointmentHistoryQuery";
import {GetNurseAppointmentScheduleQuery} from "../model/queries/GetNurseAppointmentScheduleQuery";
import {GetFacilityAvailableSlotsQuery} from "../model/queries/GetFacilityAvailableSlotsQuery";
import {GetMotherNextAppointmentQuery} from "../model/queries/GetMotherNextAppointmentQuery";
import {ListUnassignedNursesQuery} from "../model/queries/ListUnassignedNursesQuery";
import {CanRegisterFacilityQuery} from "../model/queries/CanRegisterFacilityQuery";
import {ListAllHealthFacilitiesQuery} from "../model/queries/ListAllHealthFacilitiesQuery";
import {CanRegisterResponseDto} from "../../application/dto/CanRegisterResponseDto";
import {HealthFacilityAdminListResponseDto} from "../../application/dto/HealthFacilityAdminListResponseDto";

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

    /**
     * Verifica si hay al menos un enfermero no asignado disponible
     * @returns true si hay al menos un enferfero libre
     */
    canRegisterFacility(
        query: CanRegisterFacilityQuery
    ): Promise<CanRegisterResponseDto>;

    /**
     * Lista todas las postas con información de asignación de enfermeros
     */
    listAllHealthFacilities(
        query: ListAllHealthFacilitiesQuery
    ): Promise<HealthFacilityAdminListResponseDto>;
}