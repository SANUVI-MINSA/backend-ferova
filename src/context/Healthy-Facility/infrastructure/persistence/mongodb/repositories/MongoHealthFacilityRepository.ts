import {HealthyFacilityRepository} from "../../../../domain/repositories/HealthFacilityRepository";
import {HealthFacility} from "../../../../domain/model/aggregate/HealthFacility";
import {HealthyFacilityMapper} from "../../../mappers/HealthyFacilityMapper";
import {HealthFacilityModel} from "../models/HealthFacilityModel";
import {FacilityStatus} from "../../../../domain/model/value-object/FacilityStatus";

export class MongoHealthFacilityRepository implements HealthyFacilityRepository {

    async findActiveFacilities(): Promise<HealthFacility[]> {
        const facilities =
            await HealthFacilityModel.find({
                status: FacilityStatus.ACTIVE
            });

        return facilities.map(
            facility =>
                HealthyFacilityMapper
                    .toDomain(facility)
        )
    }

    async findAll():
        Promise<HealthFacility[]> {

        const facilities =
            await HealthFacilityModel.find();

        return facilities.map(
            facility =>
                HealthyFacilityMapper
                    .toDomain(facility)
        );
    }



    async findById(
        id: string
    ): Promise<HealthFacility | null> {

        const facility =
            await HealthFacilityModel.findOne({
                id
            });

        if (!facility) {
            return null;
        }

        return HealthyFacilityMapper
            .toDomain(facility);
    }

    async save(
        facility: HealthFacility
    ): Promise<HealthFacility> {

        const data =
            HealthyFacilityMapper
                .toPersistence(facility);

        const createdFacility =
            await HealthFacilityModel.create(
                data
            );

        return HealthyFacilityMapper
            .toDomain(createdFacility);
    }

    async update(
        facility: HealthFacility
    ): Promise<void> {

        const data =
            HealthyFacilityMapper
                .toPersistence(facility);

        await HealthFacilityModel.updateOne(
            {
                id: data.id
            },
            data
        );
    }
}