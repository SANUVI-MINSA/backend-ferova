import {HealthyFacilityQueryService} from "../../../domain/services/HealthyFacilityQueryService";
import {HealthyFacilityRepository} from "../../../domain/repositories/HealthFacilityRepository";
import {AppointmentRepository} from "../../../domain/repositories/AppointmentRepository";
import {GoogleMapsAdapter} from "../../outbound-services/GoogleMapsAdapter";
import {ListHealthFacilitiesQuery} from "../../../domain/model/queries/ListHealthFacilitiesQuery";
import {GetHealthFacilityDetailQuery} from "../../../domain/model/queries/GetHealthFacilityDetailQuery";
import {GetPatientAppointmentHistoryQuery} from "../../../domain/model/queries/GetPatientAppointmentHistoryQuery";

export class HealthFacilityQueryServiceImpl
    implements HealthyFacilityQueryService {

    constructor(
        private healthFacilityRepository:
        HealthyFacilityRepository,

        private appointmentRepository:
        AppointmentRepository,

        private googleMapsAdapter:
        GoogleMapsAdapter
    ) {}

    async listHealthFacilities(
        query: ListHealthFacilitiesQuery
    ): Promise<any[]> {

        const facilities =
            await this.healthFacilityRepository
                .findActiveFacilities();

        const facilitiesWithDistance =
            await Promise.all(
                facilities.map(
                    async (facility) => {

                        const data =
                            facility.toPrimitives();

                        const distanceKm =
                            await this.googleMapsAdapter
                                .calculateDistance(
                                    query.userLatitude,
                                    query.userLongitude,
                                    data.coordinates.lat,
                                    data.coordinates.lng
                                );

                        return {
                            name: data.name,
                            status: data.status,
                            distanceKm
                        };
                    }
                )
            );

        return facilitiesWithDistance.sort(
            (a, b) =>
                a.distanceKm -
                b.distanceKm
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
        query:
        GetPatientAppointmentHistoryQuery
    ) {

        return await this
            .appointmentRepository
            .findByPatientId(
                query.patientId
            );
    }
}