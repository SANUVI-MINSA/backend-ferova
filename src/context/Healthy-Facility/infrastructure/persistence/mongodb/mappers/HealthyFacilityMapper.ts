import {HealthFacility} from "../../../../domain/model/aggregate/HealthFacility";
import {Coordinates} from "../../../../domain/model/value-object/Coordinates";
import {OperatingSchedule} from "../../../../domain/model/value-object/OperatingSchedule";
import {FacilityStatus} from "../../../../domain/model/value-object/FacilityStatus";
import {NurseAssignment} from "../../../../domain/model/entities/NurseAssignment";

export class HealthyFacilityMapper {

    static toDomain(
        document: any
    ): HealthFacility {

        return new HealthFacility(
            document.id,
            document.name,
            document.address,
            document.districtId,
            document.districtName,

            new Coordinates(
                document.coordinates.lat,
                document.coordinates.lng
            ),

            document.phoneNumber,

            document.services,

            new OperatingSchedule(
                document.operatingSchedule
                    .availableDays,

                document.operatingSchedule
                    .availableSlots
            ),

            document.scheduleOfOperation,

            document.status as FacilityStatus,
            document.nurseAssignments?.map(
                (assignment: any) =>
                    new NurseAssignment(
                        assignment.id,
                        assignment.facilityId,
                        assignment.nurseId
                    )
            )
        );
    }

    static toPersistence(
        facility: HealthFacility
    ) {

        const data =
            facility.toPrimitives();

        return {
            id: data.id,
            name: data.name,
            address: data.address,
            districtId: data.districtId,
            districtName: data.districtName,

            coordinates: {
                lat: data.coordinates.lat,
                lng: data.coordinates.lng
            },

            phoneNumber:
            data.phoneNumber,

            services:
            data.services,

            operatingSchedule: {
                availableDays:
                data.operatingSchedule
                    .availableDays,

                availableSlots:
                data.operatingSchedule
                    .availableSlots
            },

            scheduleOfOperation:
            data.scheduleOfOperation,

            status:
            data.status,

            nurseAssignments:
                data.nurseAssignments
        };
    }

}