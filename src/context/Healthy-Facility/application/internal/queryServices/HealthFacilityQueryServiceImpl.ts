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

export class HealthFacilityQueryServiceImpl
    implements HealthFacilityQueryService {

    constructor(
        private healthFacilityRepository:
        HealthyFacilityRepository,

        private appointmentRepository:
        AppointmentRepository,
    ) {}

    async listHealthFacilities(
        query: ListHealthFacilitiesQuery
    ): Promise<any[]> {

        const facilities =
            await this
                .healthFacilityRepository
                .findActiveFacilities()

        return facilities.map(
            facility => {

                const data =
                    facility.toPrimitives();

                console.log(
                    "User Lat:",
                    query.userLatitude
                );

                console.log(
                    "User Lng:",
                    query.userLongitude
                );

                console.log(
                    "Facility Data:",
                    data
                );

                console.log(
                    "Coordinates:",
                    data.coordinates
                );

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

    async getPatientAppointmentHistory(
        query: GetPatientAppointmentHistoryQuery
    ): Promise<any[]> {

        const appointments =
            await this
                .appointmentRepository
                .findByPatientId(
                    query.patientId
                );

        const history =
            await Promise.all(
                appointments.map(
                    async appointment => {

                        const appointmentData =
                            appointment.toPrimitives();

                        const facility =
                            await this
                                .healthFacilityRepository
                                .findById(
                                    appointmentData.facilityId
                                );

                        const facilityName =
                            facility
                                ?.toPrimitives()
                                .name || "Unknown";

                        return {
                            appointment,
                            facilityName
                        };
                    }
                )
            );

        return history;
    }

    async getNurseAppointmentSchedule(
        query: GetNurseAppointmentScheduleQuery
    ): Promise<Appointment[]> {

        return await this
            .appointmentRepository
            .findConfirmedByNurseId(
                query.nurseId
            );
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
}