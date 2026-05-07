import {HealthFacility} from "../../domain/model/aggregate/HealthFacility";
import {HealthFacilityDetailResource} from "../resources/HealthFacilityDetailResource";

export class
HealthFacilityDetailResourceAssembler {

    static toResource(
        facility: HealthFacility
    ): HealthFacilityDetailResource {

        const data =
            facility.toPrimitives();

        return {
            name: data.name,
            address: data.address,
            districtName:
            data.districtName,

            phoneNumber:
            data.phoneNumber,

            services:
            data.services,

            availableDays:
            data.operatingSchedule
                .availableDays,

            availableSlots:
            data.operatingSchedule
                .availableSlots,

            scheduleOfOperation:
            data.scheduleOfOperation,

            status:
            data.status
        };
    }
}