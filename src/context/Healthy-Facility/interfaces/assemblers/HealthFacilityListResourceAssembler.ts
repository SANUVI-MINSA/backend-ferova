import {HealthFacility} from "../../domain/model/aggregate/HealthFacility";
import {HealthFacilityListResource} from "../resources/HealthFacilityListResource";

export class
HealthFacilityListResourceAssembler {

    static toResource(
        facility: HealthFacility,
        distanceKm: number
    ): HealthFacilityListResource {

        const data =
            facility.toPrimitives();

        return {
            id: data.id,
            name: data.name,
            status: data.status,
            distanceKm
        };
    }
}