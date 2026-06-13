import {HealthyFacilityCommandService} from "../../../domain/services/HealthyFacilityCommandService";
import {RegisterHealthFacilityCommand} from "../../../domain/model/commands/RegisterHealthFacilityCommand";
import {AssignNurseToFacilityCommand} from "../../../domain/model/commands/AssignNurseToFacilityCommand";
import {BookAppointmentCommand} from "../../../domain/model/commands/BookAppointmentCommand";
import {CancelAppointmentCommand} from "../../../domain/model/commands/CancelAppointmentCommand";
import {ListHealthFacilitiesQuery} from "../../../domain/model/queries/ListHealthFacilitiesQuery";
import {GetPatientAppointmentHistoryQuery} from "../../../domain/model/queries/GetPatientAppointmentHistoryQuery";
import {GetHealthFacilityDetailQuery} from "../../../domain/model/queries/GetHealthFacilityDetailQuery";
import {HealthFacilityQueryService} from "../../../domain/services/HealthyFacilityQueryService";
import {GetNurseAppointmentScheduleQuery} from "../../../domain/model/queries/GetNurseAppointmentScheduleQuery";
import {Appointment} from "../../../domain/model/entities/Appointment";
import {GetFacilityAvailableSlotsQuery} from "../../../domain/model/queries/GetFacilityAvailableSlotsQuery";
import {GetMotherNextAppointmentQuery} from "../../../domain/model/queries/GetMotherNextAppointmentQuery";
import {ListUnassignedNursesQuery} from "../../../domain/model/queries/ListUnassignedNursesQuery";
import {CanRegisterResponseDto} from "../../../application/dto/CanRegisterResponseDto";
import {HealthFacilityAdminListResponseDto} from "../../../application/dto/HealthFacilityAdminListResponseDto";

export class HealthFacilityFacade {

    constructor(
        private commandService:
        HealthyFacilityCommandService,

        private queryService:
        HealthFacilityQueryService,
    ) {}

    async registerHealthFacility(
        command:
        RegisterHealthFacilityCommand
    ): Promise<void> {

        await this.commandService
            .registerFacility(
                command
            );
    }

    async assignNurseToFacility(
        command:
        AssignNurseToFacilityCommand
    ): Promise<void> {

        await this.commandService
            .assignNurseToFacility(
                command
            );
    }

    async bookAppointment(
        command:
        BookAppointmentCommand
    ): Promise<void> {

        await this.commandService
            .bookAppointment(
                command
            );
    }

    async cancelAppointment(
        command:
        CancelAppointmentCommand
    ): Promise<void> {

        await this.commandService
            .cancelAppointment(
                command
            );
    }

    async listHealthFacilities(
        query:
        ListHealthFacilitiesQuery
    ) {

        return await this.queryService
            .listHealthFacilities(
                query
            );
    }

    async getHealthFacilityDetail(
        query:
        GetHealthFacilityDetailQuery
    ) {

        return await this.queryService
            .getHealthFacilityDetail(
                query
            );
    }

    async getPatientAppointmentHistory(
        query:
        GetPatientAppointmentHistoryQuery
    ) {

        return await this.queryService
            .getPatientAppointmentHistory(
                query
            );
    }

    async getNurseAppointmentSchedule(
        query: GetNurseAppointmentScheduleQuery
    ): Promise<any[]> {

        return await this.queryService
            .getNurseAppointmentSchedule(
                query
            );
    }

    async getFacilityAvailableSlots(
        query: GetFacilityAvailableSlotsQuery
    ): Promise<any[]> {

        return await this
            .queryService
            .getFacilityAvailableSlots(
                query
            );
    }

    async getMotherNextAppointment(
        query: GetMotherNextAppointmentQuery
    ): Promise<any>{

        return await this
            .queryService
            .getMotherNextAppointment(
                query
            );
    }

    async canRegisterFacility(): Promise<CanRegisterResponseDto> {
        return await this.queryService.canRegisterFacility({});
    }

    async listAllHealthFacilities(): Promise<HealthFacilityAdminListResponseDto> {
        return await this.queryService.listAllHealthFacilities({});
    }

    async listUnassignedNurses(
        query: ListUnassignedNursesQuery
    ): Promise<{ id: string; fullName: string }[]> {
        return await this.queryService.listUnassignedNurses(query);
    }

    async validatePatientBelongsToMother(patientId: string, motherId: string): Promise<void> {
        return await this.commandService.validatePatientBelongsToMother(patientId, motherId);
    }

    async validateAppointmentBelongsToMother(appointmentId: string, motherId: string): Promise<void> {
        return await this.commandService.validateAppointmentBelongsToMother(appointmentId, motherId);
    }
}