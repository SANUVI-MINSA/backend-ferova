import {GetFoodItemDetailsQuery} from "../../model/domain/queries/GetFoodItemDetailsQuery";

export class GetFoodItemDetailsQueryAssembler {

    static toQuery(
        foodItemId: string
    ): GetFoodItemDetailsQuery {

        return {
            foodItemId
        };
    }
}