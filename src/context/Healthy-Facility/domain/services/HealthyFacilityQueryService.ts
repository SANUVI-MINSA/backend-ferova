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
import {GetMyTopAppointmentsQuery} from "../model/queries/GetMyTopAppointmentsQuery";
import {GetMyAssignedFacilityQuery} from "../model/queries/GetMyAssignedFacilityQuery";
import {NurseAssignment} from "../model/entities/NurseAssignment";

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

    /**
     * Obtiene las top N citas más próximas para un enfermero
     * @param query - Contiene nurseId y limit (opcional, default 4)
     * @returns Lista de citas con información del paciente
     */
    getMyTopAppointments(
        query: GetMyTopAppointmentsQuery
    ): Promise<any[]>;

    /**
     * Obtiene la posta asignada a un enfermero
     * @param query - Contiene nurseId
     * @returns Información de la posta o null si no tiene asignación
     */
    getMyAssignedFacility(
        query: GetMyAssignedFacilityQuery
    ): Promise<{ facility: HealthFacility; nurseAssignment: NurseAssignment } | null>;

}