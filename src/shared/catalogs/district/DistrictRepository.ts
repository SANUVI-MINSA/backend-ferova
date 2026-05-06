import { DISTRICTS } from "./DistrictSeed";
import { District } from "./District";

export class DistrictRepository {

    findAll(): District[] {
        return DISTRICTS;
    }

    findById(
        id: string
    ): District | undefined {
        return DISTRICTS.find(
            district =>
                district.getId() === id
        );
    }
}