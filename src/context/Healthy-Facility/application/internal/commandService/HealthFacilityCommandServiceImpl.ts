import {HealthyFacilityCommandService} from "../../../domain/services/HealthyFacilityCommandService";
import {HealthyFacilityRepository} from "../../../domain/repositories/HealthFacilityRepository";
import {AppointmentRepository} from "../../../domain/repositories/AppointmentRepository";
import {NurseAssignmentRepository} from "../../../domain/repositories/NurseAssignmentRepository";
import {RegisterHealthFacilityCommand} from "../../../domain/model/commands/RegisterHealthFacilityCommand";
import {HealthFacility} from "../../../domain/model/aggregate/HealthFacility";
import {randomUUID} from "node:crypto";
import {Coordinates} from "../../../domain/model/value-object/Coordinates";
import {OperatingSchedule} from "../../../domain/model/value-object/OperatingSchedule";
import {FacilityStatus} from "../../../domain/model/value-object/FacilityStatus";
import {AssignNurseToFacilityCommand} from "../../../domain/model/commands/AssignNurseToFacilityCommand";
import {NurseAssignment} from "../../../domain/model/entities/NurseAssignment";
import {BookAppointmentCommand} from "../../../domain/model/commands/BookAppointmentCommand";
import {Appointment} from "../../../domain/model/entities/Appointment";
import {AppointmentStatus} from "../../../domain/model/enum/AppointmentStatus";
import {CancelAppointmentCommand} from "../../../domain/model/commands/CancelAppointmentCommand";
import {DistrictRepository} from "../../../../../shared/catalogs/district/DistrictRepository";

export class HealthFacilityCommandServiceImpl
    implements HealthyFacilityCommandService {

    constructor(
        private healthFacilityRepository:
        HealthyFacilityRepository,

        private appointmentRepository:
        AppointmentRepository,

        private nurseAssignmentRepository:
        NurseAssignmentRepository,

        private districtRepository:
        DistrictRepository
    ) {}

    async assignNurseToFacility(
        command: AssignNurseToFacilityCommand
    ): Promise<void> {

        const facility =
            await this.healthFacilityRepository
                .findById(command.facilityId);

        if (!facility) {
            throw new Error(
                "Facility not found"
            );
        }

        const assignment =
            new NurseAssignment(
                randomUUID(),
                command.facilityId,
                command.nurseId
            );

        facility.assignNurse(
            assignment
        );

        await this.nurseAssignmentRepository
            .save(assignment);

        await this.healthFacilityRepository
            .update(facility);
    }

    async bookAppointment(
        command: BookAppointmentCommand
    ): Promise<void> {

        const existingAppointment =
            await this.appointmentRepository
                .findByFacilityAndDateTime(
                    command.facilityId,
                    command.appointmentDate,
                    command.appointmentTime
                );

        if (existingAppointment) {
            throw new Error(
                "This schedule is already reserved"
            );
        }

        const appointment =
            new Appointment(
                randomUUID(),
                command.facilityId,
                command.patientId,
                command.motherId,
                null,
                command.appointmentDate,
                command.appointmentTime,
                AppointmentStatus.CONFIRMED
            );

        await this.appointmentRepository
            .save(appointment);
    }

    async cancelAppointment(
        command: CancelAppointmentCommand
    ): Promise<void> {

        const appointment =
            await this.appointmentRepository
                .findById(
                    command.appointmentId
                );

        if (!appointment) {
            throw new Error(
                "Appointment not found"
            );
        }

        appointment.cancelAppointment();

        await this.appointmentRepository
            .update(appointment);
    }

    async registerFacility(command: RegisterHealthFacilityCommand): Promise<void> {

        const scheduleOfOperation =
            this.buildScheduleOfOperation(
                command.availableDays,
                command.availableSlots
            );

        // Validar que el distrito exista antes de crear la instalación
        const district =
            this.districtRepository.findById(
                command.districtId
            );

        // Si el distrito no existe, lanzar un error
        if (!district) {
            throw new Error(
                "District not found"
            );
        }

        const facility =
            new HealthFacility(
                randomUUID(),
                command.name,
                command.address,
                command.districtId,
                district.getName(),
                new Coordinates(
                    command.latitude,
                    command.longitude
                ),

                command.phoneNumber,
                command.services,

                new OperatingSchedule(
                    command.availableDays,
                    command.availableSlots
                ),

                scheduleOfOperation,

                FacilityStatus.ACTIVE,
                []
            );

        await this.healthFacilityRepository
            .save(facility);
    }

    // Método privado para construir el scheduleOfOperation a partir de los días y slots disponibles
    private buildScheduleOfOperation(
        availableDays: string[],
        availableSlots: string[]
    ): string {

        const firstDay =
            availableDays[0];

        const lastDay =
            availableDays[
            availableDays.length - 1
                ];

        const firstSlot =
            availableSlots[0];

        const lastSlot =
            availableSlots[
            availableSlots.length - 1
                ];

        return `${firstDay} to ${lastDay} from ${firstSlot} to ${lastSlot}`;
    }
}