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
import {UserRepository} from "../../../../iam/domain/repositories/UserRepository";
import {PatientRepository} from "../../../../patient-management/domain/repositories/PatientRepository";

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
        DistrictRepository,

        private userRepository: UserRepository,

        private patientRepository: PatientRepository,
    ) {}

    /**
     * Asigna un enfermero a un establecimiento de salud (posta).
     *
     * @description
     * Este método ejecuta la lógica de negocio para asignar un enfermero a una posta,
     * garantizando la integridad de las reglas de dominio:
     *
     * 1. Una posta solo puede tener un enfermero activo a la vez.
     * 2. Un enfermero solo puede estar asignado a una única posta.
     *
     * @param command - Comando con los identificadores de la posta y el enfermero
     * @throws {Error} Si la posta no existe
     * @throws {Error} Si el enfermero no existe
     * @throws {Error} Si la posta ya tiene un enfermero asignado
     * @throws {Error} Si el enfermero ya está asignado a otra posta
     *
     * @example
     * ```typescript
     * await assignNurseToFacility({
     *     facilityId: "facility-123",
     *     nurseId: "nurse-456"
     * });
     * ```
     */
    async assignNurseToFacility(
        command: AssignNurseToFacilityCommand
    ): Promise<void> {

        const facility =
            await this.healthFacilityRepository
                .findById(command.facilityId);

        if (!facility) {
            throw new Error("Facility not found");
        }

        const userNurse = await this.userRepository
            .findNurseById(command.nurseId);

        if (!userNurse) {
            throw new Error("Nurse not found");
        }

        // ✅ VALIDACIÓN: Verificar si la posta ya tiene enfermero
        const existingAssignment =
            await this.nurseAssignmentRepository
                .findActiveByFacilityId(command.facilityId);

        if (existingAssignment) {
            throw new Error(
                `Facility already has an assigned nurse. ` +
                `Current nurse ID: ${existingAssignment.getNurseId()}`
            );
        }

        const nurseExistingAssignment =
            await this.nurseAssignmentRepository
                .findActiveByNurseId(command.nurseId);  // ← Necesitas este método

        if (nurseExistingAssignment) {
            throw new Error(
                `Nurse is already assigned to another facility. ` +
                `Facility ID: ${nurseExistingAssignment.getFacilityId()}`
            );
        }

        const userNurseData = userNurse.toPrimitives();

        const assignment = new NurseAssignment(
            randomUUID(),
            command.facilityId,
            userNurseData.id
        );

        facility.assignNurse(assignment);

        await this.nurseAssignmentRepository.save(assignment);
        await this.healthFacilityRepository.update(facility);
    }

    async bookAppointment(
        command: BookAppointmentCommand
    ): Promise<void> {

        // 1. Verificar si ya existe una cita en ese horario
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

        const patient = await this.patientRepository.findById(command.patientId);


        // 2. OBTENER EL ENFERMERO ASIGNADO A LA POSTA
        const nurseAssignment =
            await this.nurseAssignmentRepository
                .findActiveByFacilityId(command.facilityId);

        if (!nurseAssignment) {
            throw new Error(
                "This facility has no assigned nurse. Cannot book appointment."
            );
        }

        if (!patient) {
            throw new Error(
                "Patient Not Registered"
            )
        }


        const nurseId = nurseAssignment.getNurseId();
        const patientId = patient.toPrimitives()

        // 3. Crear la cita con el nurseId asignado
        const appointment =
            new Appointment(
                randomUUID(),
                command.facilityId,
                patientId.id,
                patientId.motherId,
                nurseId, // tienes el enfermero asignado
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

    async validatePatientBelongsToMother(patientId: string, motherId: string): Promise<void> {
        const patient = await this.patientRepository.findById(patientId);

        if (!patient) {
            throw new Error("Paciente no encontrado");
        }

        const patientData = patient.toPrimitives();

        if (patientData.motherId !== motherId) {
            throw new Error("Este paciente no pertenece a esta madre");
        }
    }

    async validateAppointmentBelongsToMother(appointmentId: string, motherId: string): Promise<void> {
        const appointment = await this.appointmentRepository.findById(appointmentId);

        if (!appointment) {
            throw new Error("Cita no encontrada");
        }

        const appointmentData = appointment.toPrimitives();

        if (appointmentData.motherId !== motherId) {
            throw new Error("Esta cita no pertenece a esta madre");
        }
    }
}