import {HealthyFacilityRepository} from "../../../domain/repositories/HealthFacilityRepository";
import {AppointmentRepository} from "../../../domain/repositories/AppointmentRepository";
import {ListHealthFacilitiesQuery} from "../../../domain/model/queries/ListHealthFacilitiesQuery";
import {GetHealthFacilityDetailQuery} from "../../../domain/model/queries/GetHealthFacilityDetailQuery";
import {GetPatientAppointmentHistoryQuery} from "../../../domain/model/queries/GetPatientAppointmentHistoryQuery";
import {HealthFacilityQueryService} from "../../../domain/services/HealthyFacilityQueryService";
import {DistanceCalculatorService} from "../../../infrastructure/external-services/DistanceCalculatorService";
import {GetNurseAppointmentScheduleQuery} from "../../../domain/model/queries/GetNurseAppointmentScheduleQuery";
import {Appointment} from "../../../domain/model/entities/Appointment";
import {GetFacilityAvailableSlotsQuery} from "../../../domain/model/queries/GetFacilityAvailableSlotsQuery";
import {GetMotherNextAppointmentQuery} from "../../../domain/model/queries/GetMotherNextAppointmentQuery";
import {PatientRepository} from "../../../../patient-management/domain/repositories/PatientRepository";
import { ListUnassignedNursesQuery } from "../../../domain/model/queries/ListUnassignedNursesQuery";
import { UserRepository } from "../../../../iam/domain/repositories/UserRepository";
import { NurseAssignmentRepository } from "../../../domain/repositories/NurseAssignmentRepository";
import { CanRegisterFacilityQuery } from "../../../domain/model/queries/CanRegisterFacilityQuery";
import { ListAllHealthFacilitiesQuery } from "../../../domain/model/queries/ListAllHealthFacilitiesQuery";
import {CanRegisterResponseDto} from "../../dto/CanRegisterResponseDto";
import {
    HealthFacilityAdminItemDto,
    HealthFacilityAdminListResponseDto
} from "../../dto/HealthFacilityAdminListResponseDto";
import moment from 'moment-timezone';

export class HealthFacilityQueryServiceImpl
    implements HealthFacilityQueryService {

    constructor(
        private healthFacilityRepository:
        HealthyFacilityRepository,
        private appointmentRepository:
        AppointmentRepository,
        private patientRepository: PatientRepository,
        private userRepository: UserRepository,
        private nurseAssignmentRepository: NurseAssignmentRepository
    ) {
    }

    async canRegisterFacility(
        query: CanRegisterFacilityQuery
    ): Promise<CanRegisterResponseDto> {

        const allNurses = await this.userRepository.findAllNurses();

        if (!allNurses || allNurses.length === 0) {
            return new CanRegisterResponseDto(
                false,
                "Sin enfermeros disponibles",
                "No hay personal de enfermería registrado en el sistema."
            );
        }

        let unassignedCount = 0;

        for (const nurse of allNurses) {
            const nurseData = nurse.toPrimitives();
            const activeAssignment = await this.nurseAssignmentRepository
                .findActiveByNurseId(nurseData.id);

            if (!activeAssignment) unassignedCount++;
        }

        if (unassignedCount > 0) {
            return new CanRegisterResponseDto(
                true,
                `Hay ${unassignedCount} enfermero${unassignedCount !== 1 ? 's' : ''} disponible${unassignedCount !== 1 ? 's' : ''} para asignar a una nueva posta`
            );
        }

        return new CanRegisterResponseDto(
            false,
            "Sin enfermeros disponibles",
            "Actualmente, todo el personal de enfermería registrado ha sido asignado a una posta médica. Por favor, espere al registro de nuevo personal."
        );
    }


    async listAllHealthFacilities(
        query: ListAllHealthFacilitiesQuery
    ): Promise<HealthFacilityAdminListResponseDto> {

        const allFacilities = await this.healthFacilityRepository.findAll();

        const healthFacilities = await Promise.all(
            allFacilities.map(async (facility) => {
                const data = facility.toPrimitives();

                const activeAssignment = await this.nurseAssignmentRepository
                    .findActiveByFacilityId(data.id);

                if (!activeAssignment) {
                    return new HealthFacilityAdminItemDto(
                        data.id,
                        data.name,
                        data.address,
                        null,
                        false,
                        "No nurse assigned yet"
                    );
                }

                const nurse = await this.userRepository.findNurseById(activeAssignment.getNurseId());
                const nurseData = nurse?.toPrimitives();

                return new HealthFacilityAdminItemDto(
                    data.id,
                    data.name,
                    data.address,
                    nurseData ? `${nurseData.name} ${nurseData.lastname}` : null,
                    true
                );
            })
        );

        return new HealthFacilityAdminListResponseDto(
            healthFacilities.length,
            healthFacilities
        );
    }

    async listUnassignedNurses(
        query: ListUnassignedNursesQuery
    ): Promise<{ id: string; fullName: string }[]> {

        const allNurses = await this.userRepository.findAllNurses();

        if (!allNurses || allNurses.length === 0) {
            return [];
        }

        const unassignedNurses: { id: string; fullName: string }[] = [];

        for (const nurse of allNurses) {
            const nurseData = nurse.toPrimitives();

            const activeAssignment = await this.nurseAssignmentRepository
                .findActiveByNurseId(nurseData.id);

            if (!activeAssignment) {
                unassignedNurses.push({
                    id: nurseData.id,
                    fullName: `${nurseData.name} ${nurseData.lastname}`
                });
            }
        }

        return unassignedNurses;
    }

    async listHealthFacilities(
        query: ListHealthFacilitiesQuery
    ): Promise<any[]> {

        await this.validateMotherHasPatients(query.motherId)

        const facilities =
            await this
                .healthFacilityRepository
                .findActiveFacilities()

        return facilities.map(
            facility => {

                const data =
                    facility.toPrimitives();

                const distanceKm =
                    DistanceCalculatorService
                        .calculateDistanceKm(
                            query.userLatitude,
                            query.userLongitude,
                            data.coordinates.lat,
                            data.coordinates.lng
                        );

                return {
                    facility,
                    distanceKm
                };
            }
        );
    }

    async getHealthFacilityDetail(
        query: GetHealthFacilityDetailQuery
    ) {

        return await this
            .healthFacilityRepository
            .findById(
                query.facilityId
            );
    }

    /**
     * Obtiene el historial de citas de un paciente.
     *
     * @description
     * Reglas de negocio para el historial:
     * - Muestra citas CANCELADAS (sin importar la fecha)
     * - Muestra citas CONFIRMADAS que ya PASARON (fecha < hoy O fecha = hoy y hora < ahora)
     * - NO muestra citas CONFIRMADAS que son FUTURAS
     * - Ordenadas de más reciente a más antigua
     *
     * @param query - Contiene el patientId
     * @returns Lista de citas del historial con nombre de la posta
     */
    async getPatientAppointmentHistory(
        query: GetPatientAppointmentHistoryQuery
    ): Promise<any[]> {

        const appointments = await this.appointmentRepository
            .findByPatientId(query.patientId);

        const nowPeru = moment().tz('America/Lima');

        // Filtrar citas que deben ir al historial
        const historyAppointments = appointments.filter(appointment => {
            const appointmentData = appointment.toPrimitives();
            const isCancelled = appointmentData.status === "CANCELLED";
            const isPast = this.isAppointmentPast(
                appointmentData.appointmentDate,
                appointmentData.appointmentTime
            );

            // ✅ Regla: Cancelada O (Confirmada Y Pasada)
            return isCancelled || (appointmentData.status === "CONFIRMED" && isPast);
        });

        // Ordenar de más reciente a más antigua
        const sortedHistory = historyAppointments.sort((a, b) => {
            const dateA = this.toDateTime(
                a.toPrimitives().appointmentDate,
                a.toPrimitives().appointmentTime
            );
            const dateB = this.toDateTime(
                b.toPrimitives().appointmentDate,
                b.toPrimitives().appointmentTime
            );
            return dateB.getTime() - dateA.getTime();
        });

        // Enriquecer con datos adicionales
        const history = await Promise.all(
            sortedHistory.map(async appointment => {
                const appointmentData = appointment.toPrimitives();

                const facility = await this.healthFacilityRepository
                    .findById(appointmentData.facilityId);

                const facilityName = facility?.toPrimitives().name || "Unknown";

                return {
                    appointment,
                    facilityName,
                    status: appointmentData.status,
                    statusLabel: appointmentData.status === "CANCELLED" ? "Cancelada" : "Completada",
                    wasCancelled: appointmentData.status === "CANCELLED",
                    appointmentDateTime: `${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`,
                    cancelledAt: (appointment as any).cancelledAt || null
                };
            })
        );

        return history;
    }

    /**
     * Verifica si una cita ya pasó
     */
    private isAppointmentPast(date: string, time: string): boolean {
        const nowPeru = moment().tz('America/Lima');
        const appointmentDateTime = moment.tz(
            `${date} ${time}`,
            'YYYY-MM-DD HH:mm',
            'America/Lima'
        );
        return appointmentDateTime.isBefore(nowPeru);
    }
    /**
     * Convierte fecha y hora a objeto Date
     */
    private toDateTime(date: string, time: string): Date {
        return moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', 'America/Lima').toDate();
    }

    async getNurseAppointmentSchedule(
        query: GetNurseAppointmentScheduleQuery
    ): Promise<any[]> {

        // Obtener todas las citas confirmadas del enfermero
        const allAppointments = await this.appointmentRepository
            .findConfirmedByNurseId(query.nurseId);

        const now = new Date();

        // Filtrar solo citas futuras
        const futureAppointments = allAppointments.filter(appointment => {
            const appointmentData = appointment.toPrimitives();
            const appointmentDateTime = this.toDateTime(
                appointmentData.appointmentDate,
                appointmentData.appointmentTime
            );
            return appointmentDateTime > now;
        });

        // Ordenar por fecha y hora (más cercana primero)
        const sortedAppointments = futureAppointments.sort((a, b) => {
            const dateA = this.toDateTime(
                a.toPrimitives().appointmentDate,
                a.toPrimitives().appointmentTime
            );
            const dateB = this.toDateTime(
                b.toPrimitives().appointmentDate,
                b.toPrimitives().appointmentTime
            );
            return dateA.getTime() - dateB.getTime();
        });

        const enrichedAppointments = await Promise.all(
            sortedAppointments.map(async (appointment) => {
                const appointmentData = appointment.toPrimitives();

                // Obtener paciente por ID
                const patient = await this.patientRepository
                    .findById(appointmentData.patientId);

                const patientName = patient
                    ? `${patient.toPrimitives().name} ${patient.toPrimitives().lastName}`
                    : "Desconocido";

                return {
                    appointment,
                    patientName
                };
            })
        );

        return enrichedAppointments;
    }

    async getFacilityAvailableSlots(
        query: GetFacilityAvailableSlotsQuery
    ): Promise<any[]> {

        const facility =
            await this
                .healthFacilityRepository
                .findById(
                    query.facilityId
                );

        if (!facility) {
            throw new Error(
                "Health facility not found"
            );
        }

        const facilityData =
            facility.toPrimitives();

        const appointments =
            await this
                .appointmentRepository
                .findByFacilityAndDate(
                    query.facilityId,
                    query.appointmentDate
                );

        const occupiedTimes =
            appointments.map(
                appointment =>
                    appointment
                        .toPrimitives()
                        .appointmentTime
            );

        const result =
            facilityData
                .operatingSchedule
                .availableSlots
                .map(
                    (time: string) => ({
                        time,
                        status:
                            occupiedTimes.includes(
                                time
                            )
                                ? "OCCUPIED"
                                : "AVAILABLE"
                    })
                );

        return result;
    }

    async getMotherNextAppointment(
        query: GetMotherNextAppointmentQuery
    ): Promise<any> {

        const appointment =
            await this
                .appointmentRepository
                .findNextAppointmentByMotherId(
                    query.motherId
                );

        if (!appointment) {
            return null;
        }

        const appointmentData =
            appointment.toPrimitives();

        const facility =
            await this
                .healthFacilityRepository
                .findById(
                    appointmentData.facilityId
                );

        return {
            appointment,
            facilityName:
                facility
                    ?.toPrimitives()
                    .name || "Unknown"
        };
    }


    private async validateMotherHasPatients(motherId: string): Promise<void> {
        const patients = await this.patientRepository.findByMotherId(motherId);
        if (!patients || patients.length === 0) {
            throw new Error("Debes registrar al menos un paciente antes de usar esta función");
        }
    }
}